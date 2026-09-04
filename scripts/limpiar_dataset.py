#!/usr/bin/env python3
"""
Limpieza y feature engineering — dataset EO La Ligua.
- NASA POWER usa -999 como fill value → limpiar
- Fusión: Open-Meteo (ERA5) como fuente primaria climática
- Features satelitales auxiliares de NASA POWER (rad solar CERES)
- Guardar dataset final limpio para el benchmark
"""
import csv, math

SRC = "/home/seba/shiva/myco_eo_paper/data/eo_laligna_daily.csv"
OUT = "/home/seba/shiva/myco_eo_paper/data/eo_laligna_clean.csv"

def clean(v):
    if v in (None, ""):
        return None
    try:
        f = float(v)
    except ValueError:
        return None
    if f <= -900:  # NASA POWER fill
        return None
    return f

rows = []
with open(SRC) as f:
    for r in csv.DictReader(f):
        d = {
            "date": r["date"],
            "tmax_c": clean(r["om_tmax_c"]),
            "tmin_c": clean(r["om_tmin_c"]),
            "precip_era5_mm": clean(r["om_precip_mm"]),
            "rad_era5_mj": clean(r["om_rad_mj"]),
            "eto_era5_mm": clean(r["om_eto_mm"]),
            "tmean_np_c": clean(r["np_tmean_c"]),
            "rh_np_pct": clean(r["np_rh_pct"]),
            "precip_np_mm": clean(r["np_precip_mm"]),
            "rad_np_mj": clean(r["np_rad_mj"]),
            "ps_np_kpa": clean(r["np_ps_kpa"]),
        }
        rows.append(d)

# Stats de cobertura tras limpieza
n = len(rows)
def cov(key):
    return sum(1 for r in rows if r[key] is not None)
print(f"Días: {n}")
for k in rows[0]:
    if k != "date":
        print(f"  {k}: {cov(k)} ({100*cov(k)/n:.0f}%)")

# Rellenar tmean con promedio tmax/tmin cuando falte
for r in rows:
    if r["tmean_np_c"] is None and r["tmax_c"] is not None and r["tmin_c"] is not None:
        r["tmean_np_c"] = round((r["tmax_c"] + r["tmin_c"]) / 2, 2)

with open(OUT, "w", newline="") as f:
    keys = list(rows[0].keys())
    w = csv.DictWriter(f, fieldnames=keys)
    w.writeheader()
    for r in rows:
        w.writerow(r)
print(f"\n✅ Dataset limpio → {OUT}")
