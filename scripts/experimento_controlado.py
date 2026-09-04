#!/usr/bin/env python3
"""
Myco-Opt × EO — EXPERIMENTO CONTROLADO DEFINITIVO.
Presupuesto bajo (N trials) — la tesis H3: el prior biológico importa más
cuando las evaluaciones son caras/escasas.

Métodos (mismo presupuesto, 3 seeds):
  1. Random Search
  2. Optuna TPE
  3. OPRO-vanilla (LLM sin prior — espacio completo)
  4. Myco-Opt (LLM con prior fúngico real — espacio restringido)

Salida: curvas de convergencia (best RMSE val vs trial) + RMSE test final.
"""
import csv, json, math, os, random, time
import numpy as np
import lightgbm as lgb
import optuna
from sklearn.metrics import mean_squared_error, r2_score, mean_absolute_error
from urllib import request

random.seed(42); np.random.seed(42)
optuna.logging.set_verbosity(optuna.logging.WARNING)
N_TRIALS = 12          # presupuesto bajo
N_SEEDS = 3
OUT = "/home/seba/shiva/myco_eo_paper/data/experimento_controlado.json"

# ─── Datos ───
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
FEAT_NAMES = [k for k in csv.DictReader(open("/home/seba/shiva/myco_eo_paper/data/ml_features.csv")).fieldnames
              if k not in ("date", "eto_t1")]

# ─── Prior fúngico ───
with open("/home/seba/shiva/myco_eo_paper/data/fungal_prior_metrics.json") as f:
    fp = json.load(f)
Q = fp["modularity_Q"]; gamma = fp["gamma_scale_free"]; sigma = fp["sigma_smallworld"]
L_ = fp["L_avg_path"]; C = fp["C_clustering"]

def fungal_ranges():
    nl = int(np.clip(round(Q * 100), 20, 100))
    md = int(np.clip(round(L_ * 3), 3, 12))
    lam = float(np.clip(C * 20, 0.5, 6.0))
    col = float(np.clip(1.0 - gamma * 0.15, 0.4, 0.95))
    lr = float(np.clip(sigma * 0.05, 0.02, 0.25))
    return {
        "n_estimators": (150, 500),
        "learning_rate": (max(0.01, lr * 0.5), min(0.3, lr * 2.0)),
        "num_leaves": (max(8, nl - 12), min(128, nl + 12)),
        "max_depth": (max(3, md - 2), min(15, md + 2)),
        "min_child_samples": (10, 60),
        "subsample": (0.65, 0.95),
        "colsample_bytree": (max(0.4, col - 0.1), min(1.0, col + 0.1)),
        "reg_alpha": (0.0, 2.0),
        "reg_lambda": (max(0.1, lam - 1.5), min(8.0, lam + 1.5)),
    }

FULL_SPACE = {
    "n_estimators": (50, 800), "learning_rate": (0.01, 0.3),
    "num_leaves": (8, 128), "max_depth": (3, 20),
    "min_child_samples": (5, 100), "subsample": (0.5, 1.0),
    "colsample_bytree": (0.4, 1.0), "reg_alpha": (0.0, 5.0),
    "reg_lambda": (0.0, 5.0)}

def train_eval(params):
    m = lgb.LGBMRegressor(n_estimators=int(params["n_estimators"]),
        learning_rate=params["learning_rate"], num_leaves=int(params["num_leaves"]),
        max_depth=int(params["max_depth"]), min_child_samples=int(params["min_child_samples"]),
        subsample=params["subsample"], colsample_bytree=params["colsample_bytree"],
        reg_alpha=params["reg_alpha"], reg_lambda=params["reg_lambda"],
        random_state=42, verbose=-1, n_jobs=4)
    m.fit(Xtr, ytr)
    return mean_squared_error(yva, m.predict(Xva)) ** 0.5

def eval_test(params):
    m = lgb.LGBMRegressor(n_estimators=int(params["n_estimators"]),
        learning_rate=params["learning_rate"], num_leaves=int(params["num_leaves"]),
        max_depth=int(params["max_depth"]), min_child_samples=int(params["min_child_samples"]),
        subsample=params["subsample"], colsample_bytree=params["colsample_bytree"],
        reg_alpha=params["reg_alpha"], reg_lambda=params["reg_lambda"],
        random_state=42, verbose=-1, n_jobs=4)
    m.fit(Xtr, ytr); p = m.predict(Xte)
    return {"rmse": mean_squared_error(yte, p) ** 0.5,
            "mae": mean_absolute_error(yte, p),
            "r2": r2_score(yte, p)}

def sample_params(space, seed):
    rng = random.Random(seed)
    return {k: rng.uniform(a, b) if isinstance(a, float) else rng.randint(a, b)
            for k, (a, b) in space.items()}

def clamp_params(p, space):
    p = dict(p)
    for k, (a, b) in space.items():
        if isinstance(a, float):
            p[k] = float(np.clip(p[k], a, b))
        else:
            p[k] = int(np.clip(p[k], a, b))
    return p

# ─── LLM (compartido por OPRO-vanilla y Myco-Opt) ───
def get_key():
    keys = {}
    for line in open("/home/seba/shiva/.env"):
        if "=" in line and not line.strip().startswith("#"):
            k, _, v = line.strip().partition("=")
            keys[k.strip()] = v.strip()
    return keys

def llm_propose(history, space_desc, prior_instructions):
    cfg = get_key()
    api_key = cfg.get("DASHSCOPE_API_KEY", "")
    raw = cfg.get("DASHSCOPE_BASE_URL", "https://dashscope-intl.aliyuncs.com")
    base = raw + "/compatible-mode/v1" if not raw.endswith("compatible-mode/v1") else raw
    sys = ("You are an expert hyperparameter optimizer for LightGBM regression "
           "predicting daily evapotranspiration ET0 (mm/day) for avocado orchards "
           "from satellite/climate features (La Ligua, Chile). Target: minimize validation RMSE. "
           "Search space:\n" + space_desc + "\n" + prior_instructions +
           "\nReply STRICTLY as JSON with keys: n_estimators, learning_rate, num_leaves, "
           "max_depth, min_child_samples, subsample, colsample_bytree, reg_alpha, reg_lambda.")
    hist = ""
    for h in history[-6:]:
        hist += f"trial {h['i']}: {json.dumps(h['params'])} → RMSE {h['rmse']:.4f}\n"
    payload = {"model": "qwen-plus", "messages": [
        {"role": "system", "content": sys},
        {"role": "user", "content": f"History:\n{hist}\nPropose trial #{len(history)+1}:"}],
        "temperature": 0.7, "max_tokens": 300}
    req = request.Request(base + "/chat/completions", data=json.dumps(payload).encode(),
        headers={"Content-Type": "application/json", "Authorization": f"Bearer {api_key}"},
        method="POST")
    try:
        with request.urlopen(req, timeout=60) as r:
            resp = json.loads(r.read())
        text = resp["choices"][0]["message"]["content"]
        s, e = text.find("{"), text.rfind("}") + 1
        if 0 <= s < e:
            return json.loads(text[s:e])
    except Exception as ex:
        print(f"    [LLM error: {ex}]", flush=True)
    return None

def run_random(seed):
    curve = []
    best_params = None
    best_rmse = float("inf")
    for i in range(N_TRIALS):
        p = sample_params(FULL_SPACE, seed * 1000 + i)
        rmse = train_eval(p)
        curve.append(rmse)
        if rmse < best_rmse:
            best_rmse = rmse
            best_params = p
    return {"curve": curve, "best_rmse": best_rmse}, best_params

def run_optuna(seed):
    curve = []
    best_params = {}
    def obj(trial):
        p = {k: trial.suggest_int(k, a, b) if not isinstance(a, float)
             else trial.suggest_float(k, a, b, log=(k == "learning_rate"))
             for k, (a, b) in FULL_SPACE.items()}
        rmse = train_eval(p)
        curve.append(rmse)
        best_params.update(p)
        return rmse
    study = optuna.create_study(direction="minimize",
                                sampler=optuna.samplers.TPESampler(seed=seed))
    study.optimize(obj, n_trials=N_TRIALS)
    # curva correcta: el orden de trials en Optuna con early stop puede diferir; usar best-so-far
    curve_bf = np.minimum.accumulate(curve).tolist()
    return {"curve": curve_bf, "best_rmse": study.best_value}, study.best_params

def run_opro(seed, use_prior):
    space = fungal_ranges() if use_prior else FULL_SPACE
    space_desc = json.dumps({k: [round(a, 4), round(b, 4)] for k, (a, b) in space.items()})
    if use_prior:
        prior_inst = (f"IMPORTANT — biological prior from a real mycorrhizal network "
                      f"(Beiler 2010): Q={Q}, gamma={gamma}, sigma={sigma}, L={L_}, C={C}. "
                      f"The ranges above are CONSTRAINED by this topology: modularity→num_leaves, "
                      f"path→max_depth, clustering→reg_lambda, scale-free→colsample, "
                      f"small-world→learning_rate. Propose inside these ranges.")
    else:
        prior_inst = "No prior: explore the full space."
    history = []
    curve = []
    best_params = None
    for i in range(N_TRIALS):
        p = llm_propose(history, space_desc, prior_inst)
        if p is None:
            p = sample_params(space, seed * 1000 + i)
        p = clamp_params(p, space)
        rmse = train_eval(p)
        history.append({"i": i + 1, "params": p, "rmse": rmse})
        curve.append(rmse)
        if best_params is None or rmse <= min(curve):
            best_params = p
    curve_bf = np.minimum.accumulate(curve).tolist()
    return {"curve": curve_bf, "best_rmse": min(curve)}, best_params

# ─── Ejecutar ───
results = {}
t_start = time.time()

for method in ["random", "optuna"]:
    results[method] = {"seeds": [], "best_params_list": []}
    for s in range(N_SEEDS):
        print(f"\n▶ {method} seed {s}", flush=True)
        t0 = time.time()
        r, bp = run_random(s) if method == "random" else run_optuna(s)
        t_ = eval_test(bp if bp is not None else sample_params(FULL_SPACE, s))
        results[method]["seeds"].append({**r, "test": t_})
        print(f"  best val {r['best_rmse']:.4f} | test {t_['rmse']:.4f} | {time.time()-t0:.0f}s", flush=True)

for method, use_prior, label in [("opro_vanilla", False, "OPRO vanilla"),
                                 ("myco_opt", True, "Myco-Opt")]:
    results[method] = {"seeds": [], "best_params_list": []}
    for s in range(N_SEEDS):
        print(f"\n▶ {label} seed {s}", flush=True)
        t0 = time.time()
        r, bp = run_opro(s, use_prior)
        t_ = eval_test(bp)
        results[method]["seeds"].append({**r, "test": t_, "best_params": bp})
        print(f"  best val {r['best_rmse']:.4f} | test {t_['rmse']:.4f} | {time.time()-t0:.0f}s", flush=True)

# ─── Resumen agregado ───
print("\n" + "═" * 60)
print("RESUMEN AGREGADO (media ± std sobre seeds)")
summary = {}
for method, label in [("random", "Random Search"), ("optuna", "Optuna TPE"),
                      ("opro_vanilla", "OPRO-vanilla"), ("myco_opt", "Myco-Opt")]:
    rmse_test = [s["test"]["rmse"] for s in results[method]["seeds"]]
    r2_test = [s["test"]["r2"] for s in results[method]["seeds"]]
    best_val = [s["best_rmse"] for s in results[method]["seeds"]]
    # curva promedio
    curves = [s["curve"] for s in results[method]["seeds"]]
    maxlen = min(len(c) for c in curves)
    avg_curve = [np.mean([c[i] for c in curves]) for i in range(maxlen)]
    summary[method] = {
        "rmse_test_mean": float(np.mean(rmse_test)), "rmse_test_std": float(np.std(rmse_test)),
        "r2_test_mean": float(np.mean(r2_test)),
        "best_val_mean": float(np.mean(best_val)),
        "avg_curve": [round(v, 4) for v in avg_curve],
    }
    print(f"{label:15s} | best_val {np.mean(best_val):.4f}±{np.std(best_val):.4f} "
          f"| test {np.mean(rmse_test):.4f}±{np.std(rmse_test):.4f} | R2 {np.mean(r2_test):.4f}")

out = {"config": {"n_trials": N_TRIALS, "n_seeds": N_SEEDS,
                  "task": "ET0(t+1) forecast, LightGBM, La Ligua EO",
                  "split": "train<2023, val 2023-24, test 2025"},
       "fungal_prior": fp, "summary": summary, "detail": results,
       "runtime_s": round(time.time() - t_start, 1)}
with open(OUT, "w") as f:
    json.dump(out, f, indent=2)
print(f"\n✅ Experimento completo → {OUT} ({time.time()-t_start:.0f}s)")
