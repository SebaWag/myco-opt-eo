# Wood Wide Web — Project Instructions

## What This Is

A scroll-driven 3D scientific data story visualising a real mycorrhizal fungal network. Static SPA — no backend, no database, no API. Built with React 19 + Three.js, served by Caddy in Docker.

## Tech Stack

- **React 19** + **TypeScript 5.9** + **Vite 8**
- **Three.js 0.183** via React Three Fiber 9 + Drei 10
- **Zustand 5** for state management
- **Caddy 2** for static file serving in Docker
- **GitHub Actions** → GHCR for CI/CD

## Commands

```bash
npm run dev        # Local dev server (port 5173)
npm run build      # TypeScript check + Vite production build
npm run lint       # ESLint

docker compose up -d --build    # Full stack with observability (port 3000)
docker compose down
```

## File Conventions

| Pattern | Location |
|---------|----------|
| 3D scene components | `src/components/canvas/` |
| Scroll narrative sections (7) | `src/components/overlay/` |
| Interactive UI panels | `src/components/ui/` |
| Custom hooks | `src/hooks/` |
| Zustand store | `src/stores/appStore.ts` |
| Type definitions | `src/types/network.ts` |
| Utility functions | `src/utils/` |
| Scientific sources data | `src/data/sources.ts` |
| Static dataset | `public/data/network.json` |

## Architecture Notes

- Two modes: **narrative** (scroll-driven camera, 7 sections) and **interactive** (OrbitControls + HUD)
- Mode state lives in `appStore.ts` — components read from the store, not prop drilling
- Network data loaded once via `useNetworkData` hook, layout computed in `graphLayout.ts`
- Layout uses genet depthRange for vertical stratification (shallow vs deep fungi)
- Particles animated in `useNutrientFlow` — directional flow based on nutrient type, modulated by season
- Fungal genets rendered as organic TubeGeometry in `FungalGenets.tsx` — click to highlight entire organism
- Defence signal cascades via BFS from clicked tree through network graph
- Confidence overlay re-colours edges by evidence strength (green/amber/red)
- Sources panel with 20 real papers, inline citation markers on every quantitative claim
- The Caddyfile handles SPA routing (`try_files`) and reverse proxies `/grafana` and `/prometheus`

## Visual Layers

1. **Forest Canopy** — instanced trees with DBH-based allometry
2. **Soil Volume** — translucent horizon layers (O/A/B horizons)
3. **Root Systems** — bezier curves from trunk base to underground nodes
4. **Fungal Genets** — organic tube geometry per genet, coloured by species
5. **Network Edges** — line segments with nutrient/confidence colouring
6. **Nutrient Particles** — directional flow, seasonal modulation
7. **Defence Signal** — BFS cascade pulse animation
8. **Confidence Overlay** — evidence-based edge colouring toggle

## Interactive Controls

- Season dial (spring/summer/autumn/winter) — shifts nutrient flow direction
- Nutrient type toggles (carbon/phosphorus/nitrogen/water)
- Particle speed slider
- Genet highlight mode — click a genet to see its full extent
- Confidence overlay toggle — green (established) / amber (demonstrated) / red (contested)
- Defence signal — Shift+click any tree
- Sources button — opens full reference panel

## Docker

- `docker-compose.yml` — standalone local dev (builds from source)
- `docker-compose.prod.yml` — production (pulls from GHCR)
- `meweb/docker-compose.yml` — include file for meWeb shared hosting
- Observability stack matches meWeb versions (Prometheus v2.50.0, Grafana 10.3.1, Loki 3.0.0, etc.)
- `node-exporter` won't start on macOS Docker Desktop — this is expected

## Dataset

Based on Beiler et al. (2010/2015). 67 Douglas fir trees, 27 fungal genets, 220 edges in a 30×30m plot. Enhanced with:
- `cohort` per tree (veteran/mature/sapling)
- `depthRange` and `extent` per genet
- `direction` and `confidence` per edge
- Full data provenance note in metadata
