import type { NutrientType } from '../utils/colors'

export type TreeCohort = 'veteran' | 'mature' | 'sapling'
export type EdgeDirection = 'bidirectional' | 'treeToFungus' | 'fungusToTree'
export type EvidenceConfidence = 'established' | 'demonstrated' | 'contested'

export interface TreeNode {
  id: string
  x: number          // position in plot (meters)
  y: number
  dbh: number         // diameter at breast height (cm)
  isMotherTree: boolean
  connections: number // degree centrality
  species: string
  cohort: TreeCohort
}

export interface FungalGenet {
  id: string
  species: string
  color: string
  treeIds: string[]
  depthRange: [number, number] // [min, max] metres below surface
  extent: number               // genet area in m²
}

export interface NetworkEdge {
  id: string
  source: string      // tree id
  target: string      // tree id
  fungalGenetId: string
  nutrientType: NutrientType
  weight: number       // relative flow strength 0-1
  direction: EdgeDirection
  confidence: EvidenceConfidence
}

export interface NetworkData {
  trees: TreeNode[]
  genets: FungalGenet[]
  edges: NetworkEdge[]
  metadata: {
    plotSize: [number, number]  // meters
    source: string
    year: number
    dataNote: string
  }
}

export interface ComputedNetwork {
  data: NetworkData
  layout: Map<string, { x: number; y: number; z: number }>
  motherTreeIds: Set<string>
  maxDegree: number
}
