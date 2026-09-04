#!/usr/bin/env python3
"""
Myco-Opt × EO — EXPERIMENTO CENTRAL.
Comparación a presupuesto bajo (N trials):
  1. Random Search
  2. Optuna (TPE)
  3. Myco-Opt: LLM (Qwen vía DashScope) propone configs con PRIOR fúngico real
     (el espacio de búsqueda está restringido por las métricas de Beiler 2010)

Hipótesis H3 (paper): con presupuesto bajo, un prior biológico que restringe
el espacio de búsqueda converge mejor que búsqueda agnóstica.
"""
import csv, json, math, os, random, sys, time
import numpy as np
import lightgbm as lgb
from sklearn.metrics import mean_squared_error
from urllib import request

random.seed(42); np.random.seed(42)

# ─── Cargar datos (idéntico split que baselines) ───
feats, targets, dates = [], [], []
with open("/home/seba/shiva/myco_eo_paper/data/ml_features.csv") as f:
    for r in csv.DictReader(f):
        if not r.get("eto_t1"): continue
        targets.append(float(r["eto_t1"])); dates.append(r["date"])
        feats.append([float(x) if x not in ("", None) else 0.0
                      for k, x in r.items() if k not in ("date", "eto_t1")])
X = np.array(feats); y = np.array(targets); dts = np.array(dates)
tr = dts < "2023-01-01"; va = (dts >= "2023-01-01") & (dts < "2025-01-01"); te = dts >= "2025-01-01"
Xtr, ytr = X[tr], y[tr]; Xva, yva = X[va], y[va]; Xte, yte = X[te], y[te]

# ─── Prior fúngico real ───
with open("/home/seba/shiva/myco_eo_paper/data/fungal_prior_metrics.json") as f:
    fp = json.load(f)
Q = fp["modularity_Q"]; gamma = fp["gamma_scale_free"]; sigma = fp["sigma_smallworld"]
L_ = fp["L_avg_path"]; C = fp["C_clustering"]
print(f"Prior fúngico: Q={Q} γ={gamma} σ={sigma} L={L_} C={C}")

# MAPEO biológico → hiperparámetros LightGBM (diseñado en myco_opt_pipeline.md, adaptado)
def fungal_prior_ranges():
    """Rangos de búsqueda restringidos por topología fúngica real."""
    # modularidad (gremios) → num_leaves alto (muchas particiones especializadas)
    nl_center = int(np.clip(round(Q * 100), 20, 100))
    # camino medio L → profundidad limitada (red poco profunda, L=1.58 → shallow)
    md_center = int(np.clip(round(L_ * 3), 3, 12))
    # clustering C (redundancia) → regularización L2 proporcional a redundancia
    lam_center = float(np.clip(C * 20, 0.5, 6.0))
    # gamma scale-free (heterogeneidad) → colsample bajo-moderado (submuestreo tipo hub)
    col_center = float(np.clip(1.0 - gamma * 0.15, 0.4, 0.95))
    # sigma small-world (atajos) → learning_rate medio-alto (convergencia por atajos)
    lr_center = float(np.clip(sigma * 0.05, 0.02, 0.25))
    return {
        "n_estimators": (150, 500),
        "learning_rate": (max(0.01, lr_center * 0.5), min(0.3, lr_center * 2.0)),
        "num_leaves": (max(8, nl_center - 12), min(128, nl_center + 12)),
        "max_depth": (max(3, md_center - 2), min(15, md_center + 2)),
        "min_child_samples": (10, 60),
        "subsample": (0.65, 0.95),
        "colsample_bytree": (max(0.4, col_center - 0.1), min(1.0, col_center + 0.1)),
        "reg_alpha": (0.0, 2.0),
        "reg_lambda": (max(0.1, lam_center - 1.5), min(8.0, lam_center + 1.5)),
    }

def train_eval(params):
    m = lgb.LGBMRegressor(n_estimators=int(params["n_estimators"]),
        learning_rate=params["learning_rate"], num_leaves=int(params["num_leaves"]),
        max_depth=int(params["max_depth"]), min_child_samples=int(params["min_child_samples"]),
        subsample=params["subsample"], colsample_bytree=params["colsample_bytree"],
        reg_alpha=params["reg_alpha"], reg_lambda=params["reg_lambda"],
        random_state=42, verbose=-1, n_jobs=4)
    m.fit(Xtr, ytr)
    return mean_squared_error(yva, m.predict(Xva)) ** 0.5

N_TRIALS = 20  # presupuesto BAJO (la tesis: ahí el prior importa)

# ─── Myco-Opt: LLM con prior fúngico ───
# Cargar API key DashScope (Qwen). Fallback a OpenRouter si no.
def get_llm_config():
    env_path = "/home/seba/shiva/.env"
    keys = {}
    if os.path.exists(env_path):
        for line in open(env_path):
            if "=" in line and not line.strip().startswith("#"):
                k, _, v = line.strip().partition("=")
                keys[k.strip()] = v.strip()
    return keys

def llm_propose(history, prior_text):
    """Pide al LLM proponer 1 config dentro del prior fúngico."""
    cfg = get_llm_config()
    api_key = cfg.get("DASHSCOPE_API_KEY", "")
    raw_base = cfg.get("DASHSCOPE_BASE_URL", "https://dashscope-intl.aliyuncs.com")
    base = raw_base + "/compatible-mode/v1" if not raw_base.endswith("compatible-mode/v1") else raw_base
    sys_prompt = (
        "You are Myco-Opt, a hyperparameter optimizer for LightGBM regression on an "
        "Earth Observation task (predicting daily reference evapotranspiration ET0 for "
        "avocado orchards in La Ligua, Chile). Your search space is CONSTRAINED by the "
        "topology of a real mycorrhizal network (Beiler et al. 2010):\n" + prior_text +
        "\nThe biological priors map as: modularity(communities)→num_leaves, "
        "avg_path_length(shallowness)→max_depth, clustering(redundancy)→reg_lambda, "
        "scale-free(heterogeneity)→colsample_bytree, small-world(shortcuts)→learning_rate.\n"
        "You have seen {n} configs. Propose ONE new config likely to minimize validation RMSE.\n"
        "Reply STRICTLY as JSON: {\"n_estimators\":int,\"learning_rate\":float,\"num_leaves\":int,"
        "\"max_depth\":int,\"min_child_samples\":int,\"subsample\":float,\"colsample_bytree\":float,"
        "\"reg_alpha\":float,\"reg_lambda\":float}"
    )
    hist_text = ""
    for h in history[-5:]:
        hist_text += f"config {h['i']}: {json.dumps(h['params'])} → RMSE val {h['rmse']:.4f}\n"
    user = f"History:\n{hist_text}\nPropose config #{len(history)+1}:"

    payload = {
        "model": "qwen-plus",  # o qwen-max; ajustable
        "messages": [
            {"role": "system", "content": sys_prompt},
            {"role": "user", "content": user},
        ],
        "temperature": 0.7,
    }
    req = request.Request(base + "/chat/completions",
        data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json",
                 "Authorization": f"Bearer {api_key}"},
        method="POST")
    try:
        with request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        text = resp["choices"][0]["message"]["content"]
        # extraer JSON
        start = text.find("{"); end = text.rfind("}") + 1
        if start >= 0 and end > start:
            p = json.loads(text[start:end])
            # clamp a rangos válidos
            p = {k: float(v) if isinstance(v, (int, float)) else None for k, v in p.items()}
            return p
    except Exception as e:
        print(f"  [LLM error: {e}]", flush=True)
    return None

# Rango fúngico para el prompt
rng = fungal_prior_ranges()
prior_text = json.dumps({k: [round(v[0], 4), round(v[1], 4)] for k, v in rng.items()})

history = []
print(f"\n=== MYCO-OPT (LLM + prior fúngico) — {N_TRIALS} trials ===")
best_rmse = float("inf"); best_params = None
t0 = time.time()
for i in range(N_TRIALS):
    p = llm_propose(history, prior_text)
    if p is None:
        # fallback: muestreo dentro del prior (prior-guided random)
        p = {k: random.uniform(v[0], v[1]) if k in ("learning_rate","subsample","colsample_bytree","reg_alpha","reg_lambda")
             else random.randint(int(v[0]), int(v[1]))
             for k, v in rng.items()}
    # clamps duros
    p["n_estimators"] = int(np.clip(p["n_estimators"], 50, 800))
    p["learning_rate"] = float(np.clip(p["learning_rate"], 0.01, 0.3))
    p["num_leaves"] = int(np.clip(p["num_leaves"], 8, 128))
    p["max_depth"] = int(np.clip(p["max_depth"], 3, 20))
    p["min_child_samples"] = int(np.clip(p["min_child_samples"], 5, 100))
    p["subsample"] = float(np.clip(p["subsample"], 0.5, 1.0))
    p["colsample_bytree"] = float(np.clip(p["colsample_bytree"], 0.4, 1.0))
    p["reg_alpha"] = float(np.clip(p["reg_alpha"], 0.0, 8.0))
    p["reg_lambda"] = float(np.clip(p["reg_lambda"], 0.0, 8.0))
    rmse = train_eval(p)
    history.append({"i": i + 1, "params": p, "rmse": rmse})
    if rmse < best_rmse:
        best_rmse, best_params = rmse, p
    print(f"  trial {i+1}: RMSE={rmse:.4f}" + (" ★" if rmse == best_rmse else ""), flush=True)

# Evaluar mejor en TEST
m = lgb.LGBMRegressor(n_estimators=int(best_params["n_estimators"]),
    learning_rate=best_params["learning_rate"], num_leaves=int(best_params["num_leaves"]),
    max_depth=int(best_params["max_depth"]), min_child_samples=int(best_params["min_child_samples"]),
    subsample=best_params["subsample"], colsample_bytree=best_params["colsample_bytree"],
    reg_alpha=best_params["reg_alpha"], reg_lambda=best_params["reg_lambda"],
    random_state=42, verbose=-1, n_jobs=4)
m.fit(Xtr, ytr)
rmse_test = mean_squared_error(yte, m.predict(Xte)) ** 0.5
from sklearn.metrics import r2_score
r2_test = r2_score(yte, m.predict(Xte))

print(f"\n=== RESULTADO MYCO-OPT ===")
print(f"Mejor RMSE val: {best_rmse:.4f} | RMSE test: {rmse_test:.4f} | R2: {r2_test:.4f}")
print(f"Tiempo: {time.time()-t0:.0f}s")
with open("/home/seba/shiva/myco_eo_paper/data/mycoopt_result.json", "w") as f:
    json.dump({"best_rmse_val": best_rmse, "rmse_test": rmse_test, "r2_test": r2_test,
               "best_params": best_params, "history": history,
               "fungal_prior": fp}, f, indent=2)
print("✅ Guardado → data/mycoopt_result.json")
