#!/usr/bin/env python3
"""
Myco-Opt × EO — Descarga de dataset satelital/climático real para La Ligua, Chile.
Fuentes (todas abiertas, sin API key):
  1. Open-Meteo Historical Archive (ERA5 reanálisis + ET0 FAO Penman-Monteith)
  2. NASA POWER (radiación solar satelital CERES + agroclimático)
  3. CHIRPS (precipitación satelital+gauge, UCSB) — opcional por peso

La Ligua, Chile aprox: lat -32.4524, lon -71.2311 (zona palta Hass, estrés hídrico).
"""
import csv, io, json, sys, time, urllib.request, urllib.parse
from datetime import date, timedelta

LAT, LON = -32.4524, -71.2311
OUT_CSV = "/home/seba/shiva/myco_eo_paper/data/eo_laligna_daily.csv"

def http_get_json(url, timeout=40):
    req = urllib.request.Request(url, headers={"User-Agent": "myco-eo-paper/0.1 (research)"})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return json.loads(r.read().decode())

def fetch_openmeteo(y0=2016, y1=2026):
    """Serie diaria ERA5 via Open-Meteo archive. Chunks anuales."""
    rows = []
    base = "https://archive-api.open-meteo.com/v1/archive"
    for y in range(y0, y1 + 1):
        params = {
            "latitude": LAT, "longitude": LON,
            "start_date": f"{y}-01-01", "end_date": f"{y}-12-31",
            "daily": ("temperature_2m_max,temperature_2m_min,precipitation_sum,"
                      "shortwave_radiation_sum,et0_fao_evapotranspiration"),
            "timezone": "America/Santiago",
        }
        url = base + "?" + urllib.parse.urlencode(params)
        for attempt in range(3):
            try:
                d = http_get_json(url)
                dl = d.get("daily", {})
                times = dl.get("time", [])
                for i, t in enumerate(times):
                    rows.append({
                        "date": t,
                        "src": "openmeteo_era5",
                        "tmax_c": dl.get("temperature_2m_max", [None] * len(times))[i],
                        "tmin_c": dl.get("temperature_2m_min", [None] * len(times))[i],
                        "precip_mm": dl.get("precipitation_sum", [None] * len(times))[i],
                        "rad_sfc_mj": (dl.get("shortwave_radiation_sum", [None] * len(times))[i]
                                       or 0) / 1000.0,  # MJ/m2/dia
                        "eto_mm": dl.get("et0_fao_evapotranspiration", [None] * len(times))[i],
                    })
                print(f"  Open-Meteo {y}: {len(times)} días", flush=True)
                break
            except Exception as e:
                print(f"  retry {y} ({attempt+1}): {e}", flush=True)
                time.sleep(5)
        time.sleep(1)
    return rows

def fetch_nasa_power(y0=2016, y1=2026):
    """NASA POWER: radiación CERES satelital + T + RH + precip corregida."""
    rows = []
    base = "https://power.larc.nasa.gov/api/temporal/daily/point"
    for y in range(y0, y1 + 1):
        params = {
            "parameters": ("T2M_MAX,T2M_MIN,T2M,RH2M,PRECTOTCORR,"
                           "ALLSKY_SFC_SW_DWN,PS"),
            "community": "AG", "longitude": LON, "latitude": LAT,
            "start": f"{y}0101", "end": f"{y}1231", "format": "JSON",
        }
        url = base + "?" + urllib.parse.urlencode(params)
        for attempt in range(3):
            try:
                d = http_get_json(url)
                p = d.get("properties", {}).get("parameter", {})
                keys = list(p.keys())
                dates = sorted(set().union(*[set(v.keys()) for v in p.values()] or [set()]))
                for dt in dates:
                    rows.append({
                        "date": f"{dt[:4]}-{dt[4:6]}-{dt[6:]}",
                        "src": "nasa_power",
                        "tmax_c": p.get("T2M_MAX", {}).get(dt),
                        "tmin_c": p.get("T2M_MIN", {}).get(dt),
                        "tmean_c": p.get("T2M", {}).get(dt),
                        "rh_pct": p.get("RH2M", {}).get(dt),
                        "precip_mm": p.get("PRECTOTCORR", {}).get(dt),
                        "rad_sfc_mj": p.get("ALLSKY_SFC_SW_DWN", {}).get(dt),
                        "ps_kpa": (p.get("PS", {}).get(dt) or 0) / 10.0 if p.get("PS", {}).get(dt) else None,
                    })
                print(f"  NASA POWER {y}: {len(dates)} días", flush=True)
                break
            except Exception as e:
                print(f"  retry {y} ({attempt+1}): {e}", flush=True)
                time.sleep(6)
        time.sleep(1)
    return rows

def main():
    print("Descargando Open-Meteo (ERA5 + ET0 FAO)...", flush=True)
    om = fetch_openmeteo()
    print(f"Open-Meteo total: {len(om)} filas", flush=True)
    print("Descargando NASA POWER (CERES satelital)...", flush=True)
    np_ = fetch_nasa_power()
    print(f"NASA POWER total: {len(np_)} filas", flush=True)

    # Fusionar por fecha (unión), mantener las dos fuentes como columnas separadas
    merged = {}
    for r in om:
        merged.setdefault(r["date"], {})["date"] = r["date"]
        merged[r["date"]]["om_tmax_c"] = r["tmax_c"]
        merged[r["date"]]["om_tmin_c"] = r["tmin_c"]
        merged[r["date"]]["om_precip_mm"] = r["precip_mm"]
        merged[r["date"]]["om_rad_mj"] = r["rad_sfc_mj"]
        merged[r["date"]]["om_eto_mm"] = r["eto_mm"]
    for r in np_:
        merged.setdefault(r["date"], {})["date"] = r["date"]
        merged[r["date"]]["np_tmax_c"] = r["tmax_c"]
        merged[r["date"]]["np_tmin_c"] = r["tmin_c"]
        merged[r["date"]]["np_tmean_c"] = r["tmean_c"]
        merged[r["date"]]["np_rh_pct"] = r["rh_pct"]
        merged[r["date"]]["np_precip_mm"] = r["precip_mm"]
        merged[r["date"]]["np_rad_mj"] = r["rad_sfc_mj"]
        merged[r["date"]]["np_ps_kpa"] = r["ps_kpa"]

    keys = ["date", "om_tmax_c", "om_tmin_c", "om_precip_mm", "om_rad_mj", "om_eto_mm",
            "np_tmax_c", "np_tmin_c", "np_tmean_c", "np_rh_pct", "np_precip_mm",
            "np_rad_mj", "np_ps_kpa"]
    with open(OUT_CSV, "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=keys)
        w.writeheader()
        for d in sorted(merged.keys()):
            w.writerow({k: merged[d].get(k) for k in keys})
    print(f"\n✅ Dataset fusionado: {len(merged)} días → {OUT_CSV}", flush=True)

if __name__ == "__main__":
    main()
