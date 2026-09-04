import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ComputedNetwork } from '../../types/network'
import { useAppStore } from '../../stores/appStore'

interface Props {
  network: ComputedNetwork
}

const SIGNAL_DURATION = 4000 // ms for full cascade
const RING_COUNT = 3 // concentric rings per wave step

/**
 * Defence signalling pulse: BFS cascade from triggered tree through
 * the network graph. Each wave step lights up the next ring of
 * connected trees with an expanding ring animation.
 */
export function DefenceSignal({ network }: Props) {
  const defenceSignalTreeId = useAppStore((s) => s.defenceSignalTreeId)
  const defenceSignalTime = useAppStore((s) => s.defenceSignalTime)
  const clearDefenceSignal = useAppStore((s) => s.clearDefenceSignal)

  const ringsRef = useRef<THREE.InstancedMesh>(null)

  // BFS from signal source to compute wave layers
  const waveLayers = useMemo(() => {
    if (!defenceSignalTreeId) return []

    // Build adjacency from edges
    const adj = new Map<string, Set<string>>()
    for (const edge of network.data.edges) {
      if (!adj.has(edge.source)) adj.set(edge.source, new Set())
      if (!adj.has(edge.target)) adj.set(edge.target, new Set())
      adj.get(edge.source)!.add(edge.target)
      adj.get(edge.target)!.add(edge.source)
    }

    // BFS
    const visited = new Set<string>([defenceSignalTreeId])
    const layers: string[][] = [[defenceSignalTreeId]]
    let frontier = [defenceSignalTreeId]

    while (frontier.length > 0) {
      const next: string[] = []
      for (const nodeId of frontier) {
        const neighbours = adj.get(nodeId)
        if (!neighbours) continue
        for (const n of neighbours) {
          if (!visited.has(n)) {
            visited.add(n)
            next.push(n)
          }
        }
      }
      if (next.length > 0) {
        layers.push(next)
        frontier = next
      } else {
        break
      }
    }

    return layers
  }, [defenceSignalTreeId, network.data.edges])

  // Flatten all tree positions for ring rendering
  const ringData = useMemo(() => {
    const data: { position: THREE.Vector3; layer: number }[] = []

    for (let layerIdx = 0; layerIdx < waveLayers.length; layerIdx++) {
      for (const treeId of waveLayers[layerIdx]) {
        const pos = network.layout.get(treeId)
        if (pos) {
          data.push({
            position: new THREE.Vector3(pos.x, pos.y, pos.z),
            layer: layerIdx,
          })
        }
      }
    }

    return data
  }, [waveLayers, network.layout])

  const totalRings = ringData.length * RING_COUNT
  const dummy = useMemo(() => new THREE.Object3D(), [])

  useFrame(() => {
    if (!ringsRef.current || !defenceSignalTreeId || ringData.length === 0) return

    const elapsed = Date.now() - defenceSignalTime
    if (elapsed > SIGNAL_DURATION) {
      clearDefenceSignal()
      return
    }

    const progress = elapsed / SIGNAL_DURATION
    const maxLayer = waveLayers.length

    for (let i = 0; i < ringData.length; i++) {
      const { position, layer } = ringData[i]
      const layerProgress = progress * maxLayer - layer

      for (let r = 0; r < RING_COUNT; r++) {
        const idx = i * RING_COUNT + r
        const ringOffset = r * 0.15

        if (layerProgress < ringOffset || layerProgress > 1.2 + ringOffset) {
          // Not yet reached or faded out
          dummy.position.set(0, -100, 0)
          dummy.scale.setScalar(0)
        } else {
          const t = Math.min(1, (layerProgress - ringOffset) / 0.8)
          const scale = 0.2 + t * 0.6
          const fadeOut = Math.max(0, 1 - (layerProgress - ringOffset - 0.6) / 0.6)

          dummy.position.copy(position)
          dummy.scale.setScalar(scale)

          // Update material opacity via color intensity
          const mesh = ringsRef.current!
          const color = new THREE.Color('#FF4444')
          color.multiplyScalar(fadeOut * 2)
          mesh.setColorAt(idx, color)
        }

        dummy.updateMatrix()
        ringsRef.current!.setMatrixAt(i * RING_COUNT + r, dummy.matrix)
      }
    }

    ringsRef.current.instanceMatrix.needsUpdate = true
    if (ringsRef.current.instanceColor) {
      ringsRef.current.instanceColor.needsUpdate = true
    }
  })

  if (!defenceSignalTreeId || totalRings === 0) return null

  return (
    <instancedMesh ref={ringsRef} args={[undefined, undefined, Math.max(1, totalRings)]}>
      <ringGeometry args={[0.8, 1.0, 16]} />
      <meshBasicMaterial
        color="#FF4444"
        transparent
        opacity={0.6}
        side={THREE.DoubleSide}
        depthWrite={false}
        toneMapped={false}
      />
    </instancedMesh>
  )
}
