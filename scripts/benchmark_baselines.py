#!/usr/bin/env python3
"""
Benchmark 1/4 — Baselines clásicos en la tarea EO La Ligua.
Random Search y Optuna (TPE) sobre LightGBM.
Split temporal estricto: train 2016-2022 | val 2023-2024 | test 2025.
"""
import csv, math, random, time
import numpy as np
import lightgbm as lgb
import optuna
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score

random.seed(42); np.random.seed(42)
optuna.logging.set_verbosity(optuna.logging.WARNING)

# --- Cargar features
feats, targets, dates = [], [], []
with open("/home/seba/shiva/myco_eo_paper/data/ml_features.csv") as f:
    for r in csv.DictReader(f):
        if not r.get("eto_t1"):
            continue
        targets.append(float(r["eto_t1"]))
        dates.append(r["date"])
        feats.append([float(x) if x not in ("", None) else 0.0
                      for k, x in r.items() if k not in ("date", "eto_t1")])

X = np.array(feats); y = np.array(targets); dts = np.array(dates)
print(f"X: {X.shape}, y media: {y.mean():.3f}")

# Split temporal estricto
train_mask = dts < "2023-01-01"
val_mask = (dts >= "2023-01-01") & (dts < "2025-01-01")
test_mask = dts >= "2025-01-01"
Xtr, ytr = X[train_mask], y[train_mask]
Xva, yva = X[val_mask], y[val_mask]
Xte, yte = X[test_mask], y[test_mask]
print(f"train: {len(ytr)} | val: {len(yva)} | test: {len(yte)}")
print(f"ET0 test media: {yte.mean():.3f} mm/d")

N_TRIALS = 30
BUDGET_PER_TRIAL = 60  # segundos aprox

def train_eval(params, Xtr, ytr, Xva, yva):
    model = lgb.LGBMRegressor(
        n_estimators=int(params["n_estimators"]),
        learning_rate=params["learning_rate"],
        num_leaves=int(params["num_leaves"]),
        max_depth=int(params["max_depth"]),
        min_child_samples=int(params["min_child_samples"]),
        subsample=params["subsample"],
        colsample_bytree=params["colsample_bytree"],
        reg_alpha=params["reg_alpha"],
        reg_lambda=params["reg_lambda"],
        random_state=42, verbose=-1, n_jobs=4)
    model.fit(Xtr, ytr)
    pred = model.predict(Xva)
    return mean_squared_error(yva, pred) ** 0.5  # RMSE val

# --- 1) Random Search
print("\n=== RANDOM SEARCH ===")
best_rs = None; best_rs_score = float("inf")
space = {
    "n_estimators": (50, 800), "learning_rate": (0.01, 0.3),
    "num_leaves": (8, 128), "max_depth": (3, 20),
    "min_child_samples": (5, 100), "subsample": (0.5, 1.0),
    "colsample_bytree": (0.4, 1.0), "reg_alpha": (0.0, 5.0),
    "reg_lambda": (0.0, 5.0)}
t0 = time.time()
for i in range(N_TRIALS):
    p = {k: random.uniform(a, b) if isinstance(a, float) else random.randint(a, b)
         for k, (a, b) in space.items()}
    score = train_eval(p, Xtr, ytr, Xva, yva)
    if score < best_rs_score:
        best_rs_score, best_rs = score, p
print(f"Random Search ({N_TRIALS} trials): RMSE val = {best_rs_score:.4f} en {time.time()-t0:.0f}s")

# --- 2) Optuna TPE
print("\n=== OPTUNA (TPE) ===")
def objective(trial):
    p = {
        "n_estimators": trial.suggest_int("n_estimators", 50, 800),
        "learning_rate": trial.suggest_float("learning_rate", 0.01, 0.3, log=True),
        "num_leaves": trial.suggest_int("num_leaves", 8, 128),
        "max_depth": trial.suggest_int("max_depth", 3, 20),
        "min_child_samples": trial.suggest_int("min_child_samples", 5, 100),
        "subsample": trial.suggest_float("subsample", 0.5, 1.0),
        "colsample_bytree": trial.suggest_float("colsample_bytree", 0.4, 1.0),
        "reg_alpha": trial.suggest_float("reg_alpha", 0.0, 5.0),
        "reg_lambda": trial.suggest_float("reg_lambda", 0.0, 5.0)}
    return train_eval(p, Xtr, ytr, Xva, yva)

study = optuna.create_study(direction="minimize", sampler=optuna.samplers.TPESampler(seed=42))
t0 = time.time()
study.optimize(objective, n_trials=N_TRIALS)
print(f"Optuna ({N_TRIALS} trials): RMSE val = {study.best_value:.4f} en {time.time()-t0:.0f}s")

# --- Baseline trivial: persistencia (usar eto_lag1 del test)
header = [k for k in csv.DictReader(open("/home/seba/shiva/myco_eo_paper/data/ml_features.csv")).fieldnames if k not in ("date", "eto_t1")]
lag1_idx = header.index("eto_lag1")
pred_lag1 = Xte[:, lag1_idx]
rmse_lag1 = mean_squared_error(yte, pred_lag1) ** 0.5
print(f"\nBaseline persistencia ET0(t) → RMSE test = {rmse_lag1:.4f}")

# --- Evaluación en TEST de mejores configs
print("\n=== EVALUACIÓN EN TEST ===")
def eval_test(params, tag):
    m = lgb.LGBMRegressor(n_estimators=int(params["n_estimators"]),
        learning_rate=params["learning_rate"], num_leaves=int(params["num_leaves"]),
        max_depth=int(params["max_depth"]), min_child_samples=int(params["min_child_samples"]),
        subsample=params["subsample"], colsample_bytree=params["colsample_bytree"],
        reg_alpha=params["reg_alpha"], reg_lambda=params["reg_lambda"],
        random_state=42, verbose=-1, n_jobs=4)
    m.fit(Xtr, ytr)
    p = m.predict(Xte)
    rmse = mean_squared_error(yte, p) ** 0.5
    mae = mean_absolute_error(yte, p)
    r2 = r2_score(yte, p)
    print(f"{tag}: RMSE={rmse:.4f} MAE={mae:.4f} R2={r2:.4f}")

# Re-optimizar sobre train+val para test? Mantener simple: reportar val→test con la mejor config de cada uno
eval_test(best_rs, "RandomSearch (mejor val)")
eval_test(study.best_params, "Optuna (mejor val)")

# Guardar mejores params
import json
with open("/home/seba/shiva/myco_eo_paper/data/baselines_results.json", "w") as f:
    json.dump({"random_search": {"rmse_val": best_rs_score, "params": best_rs},
               "optuna": {"rmse_val": study.best_value, "params": study.best_params},
               "baseline_lag1_test_rmse": rmse_lag1}, f, indent=2)
print("\n✅ Resultados guardados en data/baselines_results.json")
