# The Wood Wide Web

A scroll-driven 3D visualisation of a real mycorrhizal fungal network connecting trees underground. Built with React, Three.js, and React Three Fiber.

The dataset is based on Beiler et al. (2010/2015) research — a 30x30 metre Douglas fir plot with 67 trees, 27 fungal genets, and 220 inter-tree connections.

## Modes

**Narrative mode** (default) — scroll through five editorial sections while the camera flies from above the canopy down into the underground network.

**Interactive mode** — explore the 3D scene freely with orbit controls, toggle nutrient types (carbon, phosphorus, nitrogen, water), adjust particle speed, and click tree nodes for details.

## Local Development

### Without Docker

```bash
npm install
npm run dev        # http://localhost:5173
```

### With Docker

```bash
docker compose up -d --build    # http://localhost:3000
docker compose down
```

The Docker stack includes:
- **Caddy** serving the static SPA on port 80
- **Grafana** at `/grafana` (admin/admin)
- **Prometheus** at `/prometheus`
- Loki + Promtail for log aggregation
- cAdvisor for container metrics

> **Note:** `node-exporter` requires Linux `rslave` mounts and won't start on macOS Docker Desktop. This is expected — it works on Linux production hosts.

## Production

```bash
docker compose -f docker-compose.prod.yml up -d
```

Uses pre-built image from `ghcr.io/darrylcauldwell/woodwideweb:latest`.

## Build

```bash
npm run build      # TypeScript check + Vite build → dist/
npm run lint       # ESLint
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | React 19, TypeScript 5.9 |
| 3D | Three.js 0.183, React Three Fiber 9, Drei 10 |
| Effects | React Three Postprocessing (Bloom) |
| State | Zustand 5 |
| Build | Vite 8 |
| Serve | Caddy 2 (Alpine) |
| CI | GitHub Actions → GHCR |

## Project Structure

```
src/
├── components/
│   ├── canvas/       # 3D scene: trees, network, particles, camera
│   ├── overlay/      # Scroll narrative sections
│   └── ui/           # Interactive HUD, node info panel
├── hooks/            # Data loading, particle animation, scroll tracking
├── stores/           # Zustand app state
├── types/            # TypeScript interfaces
└── utils/            # Colors, easing, graph layout
public/
└── data/network.json # Mycorrhizal network dataset
observability/        # Prometheus, Grafana, Loki, Promtail configs
meweb/                # meWeb shared hosting integration
```

## Dataset

`public/data/network.json` contains 67 trees, 27 fungal genets (Rhizopogon species), and 220 edges. Tree positions and sizes follow allometric models. Mother trees (high-connectivity hubs) are identified by degree centrality.
