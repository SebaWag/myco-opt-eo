#!/usr/bin/env python3
"""
Feature engineering — pronóstico de demanda hídrica (ET0) para La Ligua.
Tarea: predecir ET0(t+h) con h=1 usando features EO observables en t
(lags de ET0, rad solar, T, RH, precip, presión + estacionalidad).

Output: X (features), y (target t+1), splits temporales estrictos.
"""
import csv, math, random
from datetime import datetime

SRC = "/home/seba/shiva/myco_eo_paper/data/eo_laligna_clean.csv"
OUT_X = "/home/seba/shiva/myco_eo_paper/data/ml_features.csv"
random.seed(42)

rows = []
with open(SRC) as f:
    for r in csv.DictReader(f):
        rows.append(r)
rows.sort(key=lambda r: r["date"])
print(f"Filas crudas: {len(rows)}")

def fnum(r, key):
    v = r.get(key)
    if v in (None, ""):
        return None
    try:
        return float(v)
    except ValueError:
        return None

# Construir serie numérica
series = []
for r in rows:
    d = datetime.strptime(r["date"], "%Y-%m-%d")
    series.append({
        "date": r["date"], "doy": d.timetuple().tm_yday, "year": d.year,
        "tmax": fnum(r, "tmax_c"), "tmin": fnum(r, "tmin_c"),
        "precip": fnum(r, "precip_era5_mm"), "rad": fnum(r, "rad_era5_mj"),
        "eto": fnum(r, "eto_era5_mm"),
        "np_tmean": fnum(r, "tmean_np_c"), "np_rh": fnum(r, "rh_np_pct"),
        "np_precip": fnum(r, "precip_np_mm"), "np_rad": fnum(r, "rad_np_mj"),
        "np_ps": fnum(r, "ps_np_kpa"),
    })

def lag(s, idx, key, n):
    if idx - n >= 0:
        return s[idx - n][key]
    return None

def rollmean(s, idx, key, w):
    vals = [s[i][key] for i in range(max(0, idx - w + 1), idx + 1) if s[i][key] is not None]
    return sum(vals) / len(vals) if vals else None

feats = []
targets = []
dates_out = []
H = 1  # horizonte: predecir ET0 de mañana
MIN_LAG = 14

for i in range(MIN_LAG, len(series) - H):
    s = series[i]
    tgt = series[i + H]["eto"]  # ET0(t+1)
    if tgt is None:
        continue
    # features de calendario
    feat = {
        "doy_sin": round(math.sin(2 * math.pi * s["doy"] / 365.25), 4),
        "doy_cos": round(math.cos(2 * math.pi * s["doy"] / 365.25), 4),
    }
    # lags de la propia ET0 (autorregresivo climático)
    for n in [1, 2, 3, 7]:
        feat[f"eto_lag{n}"] = lag(series, i, "eto", n)
    # lags de variables EO
    for key in ["rad", "tmax", "tmin", "np_rh", "np_rad", "np_precip"]:
        for n in [1, 3]:
            feat[f"{key}_lag{n}"] = lag(series, i, key, n)
    # medias móviles (memoria del sistema hídrico)
    for key, w in [("eto", 7), ("rad", 7), ("np_rh", 7), ("precip", 7)]:
        feat[f"{key}_roll7"] = rollmean(series, i, key, w)
    feat["precip_lag1"] = lag(series, i, "precip", 1)
    # target
    feats.append(feat)
    targets.append(round(tgt, 4))
    dates_out.append(series[i]["date"])

# Escribir
keys = list(feats[0].keys())
with open(OUT_X, "w", newline="") as f:
    w = csv.writer(f)
    w.writerow(keys + ["date", "eto_t1"])
    for feat, tgt, dt in zip(feats, targets, dates_out):
        w.writerow([feat.get(k, "") for k in keys] + [dt, tgt])

print(f"✅ Instancias ML: {len(feats)} | features: {len(keys)} + date + target")
print(f"   Rango: {dates_out[0]} → {dates_out[-1]}")
print(f"   Target ET0(t+1): media ~{sum(targets)/len(targets):.2f} mm/d")
