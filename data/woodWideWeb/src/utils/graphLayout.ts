import type { NetworkData } from '../types/network'

interface LayoutPosition {
  x: number
  y: number
  z: number
}

/**
 * Compute the average depth for a tree based on the depthRange of all
 * genets it belongs to. Trees connected to deeper fungi sit deeper underground.
 */
function computeTreeDepth(treeId: string, data: NetworkData): number {
  const connectedGenets = data.genets.filter(g => g.treeIds.includes(treeId))
  if (connectedGenets.length === 0) return -2.0

  // Average the midpoint of each genet's depthRange, then scale to scene units
  // Real depths are 0.02-0.40m; we map to scene Y range of -1.5 to -5.0
  const avgRealDepth = connectedGenets.reduce((sum, g) => {
    const mid = (g.depthRange[0] + g.depthRange[1]) / 2
    return sum + mid
  }, 0) / connectedGenets.length

  // Map real depth (0.02 - 0.40m) to scene Y (-1.5 to -5.0)
  const minReal = 0.02
  const maxReal = 0.40
  const minScene = -1.5
  const maxScene = -5.0
  const t = (avgRealDepth - minReal) / (maxReal - minReal)
  const depth = minScene + t * (maxScene - minScene)

  // Mother trees (hub trees) slightly deeper for visual emphasis
  const tree = data.trees.find(tr => tr.id === treeId)
  const motherOffset = tree?.isMotherTree ? -0.5 : 0

  return depth + motherOffset
}

export function computeLayout(
  data: NetworkData
): Map<string, LayoutPosition> {
  const layout = new Map<string, LayoutPosition>()
  const plotScale = 1.0

  for (const tree of data.trees) {
    const cx = (tree.x - data.metadata.plotSize[0] / 2) * plotScale
    const cy = (tree.y - data.metadata.plotSize[1] / 2) * plotScale
    const depth = computeTreeDepth(tree.id, data)

    layout.set(tree.id, { x: cx, y: depth, z: cy })
  }

  return layout
}

export function getAbovegroundPosition(
  underground: LayoutPosition
): LayoutPosition {
  return {
    x: underground.x,
    y: 0,
    z: underground.z,
  }
}

export function getTreeHeight(dbh: number): number {
  return 1.5 + (dbh / 120) * 6
}

export function getTreeRadius(dbh: number): number {
  return 0.05 + (dbh / 120) * 0.25
}

export function getCanopyRadius(dbh: number): number {
  return 0.5 + (dbh / 120) * 2.5
}
