#!/usr/bin/env python3
"""
Myco-Opt × EO — Prior biológico REAL.
Red CMN árbol→árbol de Beiler et al. (2010/2015): 67 Pseudotsuga menziesii
conectados vía genets de Rhizopogon. edges ya son tree→tree con genet atributo.
Métricas → prior de búsqueda (mapeo a hiperparámetros LightGBM).
"""
import json
import networkx as nx
import numpy as np

with open("/home/seba/shiva/myco_eo_paper/data/raw/beiler2015_cmn_network.json") as f:
    net = json.load(f)

trees, genets, edges = net["trees"], net["genets"], net["edges"]
print(f"Árboles: {len(trees)} | Genets: {len(genets)} | Conexiones CMN: {len(edges)}")

# Grafo ponderado: árbol-árbol vía genet compartido (peso = nº genets o weight)
G = nx.Graph()
for t in trees:
    G.add_node(t["id"], species=t["species"], dbh=t.get("dbh"))
for e in edges:
    a, b = e["source"], e["target"]
    w = e.get("weight", 1.0)
    if G.has_edge(a, b):
        G[a][b]["weight"] += w
    else:
        G.add_edge(a, b, weight=w)
print(f"Grafo CMN: {G.number_of_nodes()} nodos, {G.number_of_edges()} aristas")

# --- Métricas topológicas reales ---
comms = nx.community.louvain_communities(G, seed=42, weight="weight")
Q = nx.community.modularity(G, comms, weight="weight")

degrees = [d for _, d in G.degree()]
deg_arr = np.array([d for d in degrees if d > 0])
counts, bins = np.histogram(deg_arr, bins=range(1, deg_arr.max() + 2), density=True)
xs, ys = bins[:-1][counts > 0], counts[counts > 0]
logx, logy = np.log(xs), np.log(ys)
A = np.vstack([logx, np.ones_like(logx)]).T
slope, _ = np.linalg.lstsq(A, logy, rcond=None)[0]
gamma = -slope

C = nx.average_clustering(G, weight="weight")
# camino medio sobre componente gigante ponderada
if nx.is_connected(G):
    L = nx.average_shortest_path_length(G, weight="weight")
    diam = nx.diameter(G)
else:
    lcc = max(nx.connected_components(G), key=len)
    Glcc = G.subgraph(lcc)
    L = nx.average_shortest_path_length(Glcc, weight="weight")
    diam = nx.diameter(Glcc)
    print(f"⚠ No conexo → camino sobre componente gigante ({len(lcc)} nodos)")

# grafo aleatorio equivalente para sigma
n0, m0 = G.number_of_nodes(), G.number_of_edges()
G_rand = nx.gnm_random_graph(n0, m0, seed=42)
C_rand = nx.average_clustering(G_rand)
if nx.is_connected(G_rand):
    L_rand = nx.average_shortest_path_length(G_rand)
else:
    lcc2 = max(nx.connected_components(G_rand), key=len)
    L_rand = nx.average_shortest_path_length(G_rand.subgraph(lcc2))
sigma = (C / C_rand) / (L / L_rand)

metrics = {
    "source": "Beiler et al. 2010/2015, Douglas-fir CMN, Rhizopogon spp.",
    "n_trees": G.number_of_nodes(),
    "n_edges_cmn": G.number_of_edges(),
    "modularity_Q": round(Q, 4),
    "gamma_scale_free": round(float(gamma), 4),
    "sigma_smallworld": round(float(sigma), 3),
    "L_avg_path": round(float(L), 4),
    "diameter": int(diam),
    "C_clustering": round(float(C), 4),
    "k_avg_degree": round(2 * m0 / n0, 3),
    "n_communities": len(comms),
}
print("\n=== MÉTRICAS RED MICORRÍZICA REAL (Beiler 2010/2015) ===")
for k, v in metrics.items():
    print(f"  {k}: {v}")

with open("/home/seba/shiva/myco_eo_paper/data/fungal_prior_metrics.json", "w") as f:
    json.dump(metrics, f, indent=2)
print("\n✅ Prior biológico → data/fungal_prior_metrics.json")
