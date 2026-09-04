import { useState, useEffect, useMemo } from 'react'
import type { NetworkData, ComputedNetwork } from '../types/network'
import { computeLayout } from '../utils/graphLayout'

export function useNetworkData(): ComputedNetwork | null {
  const [data, setData] = useState<NetworkData | null>(null)

  useEffect(() => {
    fetch('/data/network.json')
      .then((r) => r.json())
      .then((d: NetworkData) => setData(d))
      .catch((e) => console.error('Failed to load network data:', e))
  }, [])

  return useMemo(() => {
    if (!data) return null

    const layout = computeLayout(data)

    const motherTreeIds = new Set(
      data.trees.filter((t) => t.isMotherTree).map((t) => t.id)
    )

    const maxDegree = Math.max(...data.trees.map((t) => t.connections))

    return { data, layout, motherTreeIds, maxDegree }
  }, [data])
}
