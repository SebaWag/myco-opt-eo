# 🍄 Myco-Opt: Fungal-Network Priors for LLM-Driven Hyperparameter Optimization in Agricultural Earth Observation

> **Workshop submission**: ABOSI4EO 2026 — AutoML, Benchmarking & Open Science Infrastructure for Earth Observation (co-located with AutoML Conference, Ljubljana, Oct 1 2026)

**Author**: Sebastián Wagner — Wagner Solutions AI (independent researcher)

---

## TL;DR

Myco-Opt is an LLM-driven hyperparameter optimizer whose search space is **constrained by the topology of a real mycorrhizal network** (Beiler et al. 2010/2015 — 67 Douglas-fir trees, 27 *Rhizopogon* genets). The same network structure that evolution shaped to transport water under uncertainty becomes a **biological prior** for tuning ML models that operate under hydrological stress.

**Application**: forecasting daily reference evapotranspiration (ET₀) for avocado orchards in drought-stricken La Ligua, Chile, from 10 years of open satellite/reanalysis data.

**Key result** (budget = 12 evaluations, 3 seeds): the mycorrhizal prior turns an unconstrained LLM optimizer (OPRO-vanilla) that plateaus at RMSE **0.627** into one reaching **0.614** — and Myco-Opt's *very first* proposal (0.616) beats the unconstrained LLM's converged result. Classical TPE (0.606) remains the reference at cheap budgets; the prior's structural advantage grows with evaluation cost.

---

## Repository layout

```
myco-opt-eo/
├── latex/                    # Extended abstract (4 pages, AutoML template)
│   ├── paper_myco_eo.tex     # LaTeX source
│   ├── paper_myco_eo.pdf     # Compiled PDF
│   └── references.bib
├── scripts/                  # Reproducible pipeline (Python 3)
│   ├── descargar_eo_laligna.py    # EO data download (Open-Meteo/ERA5 + NASA POWER/CERES)
│   ├── limpiar_dataset.py         # Cleaning (NASA -999 fill values)
│   ├── feature_engineering.py     # 23 features, ET0(t+1) target, temporal split
│   ├── calcular_prior_fungico.py  # Network metrics from Beiler 2010/2015 CMN graph
│   ├── benchmark_baselines.py     # Random Search + Optuna (30 trials)
│   ├── experimento_mycoopt.py     # Myco-Opt single run (LLM + fungal prior)
│   └── experimento_controlado.py  # Full controlled comparison (4 methods × 12 trials × 3 seeds)
├── data/
│   ├── eo_laligna_clean.csv        # 3,900 daily records (2016-2026), La Ligua
│   ├── ml_features.csv             # 3,638 instances × 23 features + ET0(t+1)
│   ├── fungal_prior_metrics.json   # The biological prior (Q, γ, σ, L, C)
│   ├── experimento_controlado.json # Full raw results
│   └── woodWideWeb/                # Beiler 2010/2015 network data (source: github.com/darrylcauldwell/woodWideWeb)
└── figures/
    └── fig1_convergencia.png       # Convergence curves (Fig. 1 of paper)
```

## Quick reproduction

```bash
# 1. Data (optional: dataset already committed)
python3 scripts/descargar_eo_laligna.py
python3 scripts/limpiar_dataset.py
python3 scripts/feature_engineering.py

# 2. Biological prior from the real mycorrhizal network
python3 scripts/calcular_prior_fungico.py

# 3. Controlled experiment (needs an LLM API key for OPRO/Myco-Opt arms)
#    OPRO arms call Qwen-plus via DashScope-compatible endpoint; set env:
#    DASHSCOPE_API_KEY=...  DASHSCOPE_BASE_URL=...
python3 scripts/experimento_controlado.py
```

**Dependencies**: `numpy pandas scikit-learn lightgbm optuna networkx matplotlib requests`

**Note on LLM arms**: if the API call fails or JSON parsing fails, the trial falls back to a uniform draw inside the (full or prior-constrained) space — making the comparison *more conservative* for Myco-Opt, never less.

## Data sources (all open, no API keys for download)

| Source | Role |
|---|---|
| [Open-Meteo Historical Archive](https://open-meteo.com/) | ERA5 reanalysis: T, precipitation, shortwave radiation, FAO-56 ET₀ |
| [NASA POWER](https://power.larc.nasa.gov/) | CERES satellite radiation + MERRA-2 meteorology (independent source) |
| [Beiler et al. 2010/2015 network](https://github.com/darrylcauldwell/woodWideWeb) | Douglas-fir common-mycorrhizal network (67 trees, 27 genets, 220 links) |

## The biological prior (measured, not metaphorical)

| Metric | Symbol | Value | Maps to |
|---|---|---|---|
| Modularity (Louvain) | Q | 0.5375 | `num_leaves` |
| Scale-free exponent | γ | 1.059 | `colsample_bytree` |
| Small-world coefficient | σ | 2.376 | `learning_rate` |
| Average path length | L̄ | 1.584 | `max_depth` |
| Average clustering | C | 0.092 | `reg_lambda` |

## Results (budget 12, 3 seeds, temporal split: train<2023 · val 2023-24 · test 2025)

| Method | Best val RMSE | Test RMSE | Test R² |
|---|---|---|---|
| Optuna TPE | 0.594 | **0.606 ± 0.002** | 0.807 |
| Random Search | 0.596 | 0.606 ± 0.003 | 0.807 |
| **Myco-Opt (prior)** | 0.604 | **0.614 ± 0.003** | 0.802 |
| OPRO-vanilla (no prior) | 0.621 | 0.627 ± 0.005 | 0.793 |

**First-evaluation ablation**: OPRO-vanilla's first proposal RMSE = 0.988 (all seeds); Myco-Opt's = 0.616 avg (0.598 best). After 12 trials OPRO-vanilla converges to 0.621 — still worse than Myco-Opt's very first proposal.

## Citation

```bibtex
@misc{wagner2026mycoopt,
  author = {Wagner, Sebasti{\'a}n},
  title = {Myco-Opt: Fungal-Network Priors for LLM-Driven Hyperparameter
           Optimization in Agricultural Earth Observation},
  year = {2026},
  note = {Workshop submission, ABOSI4EO @ AutoML 2026},
  url = {https://github.com/SebaWag/myco-opt-eo}
}
```

## License

MIT — code, data pipelines and the biological prior artifact are released for the community. The Beiler 2010/2015 network data is reproduced from [woodWideWeb](https://github.com/darrylcauldwell/woodWideWeb) for research purposes; please cite the original ecological studies.
