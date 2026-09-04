import { useMemo } from 'react'
import * as THREE from 'three'
import type { ComputedNetwork } from '../../types/network'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

const POINTS_PER_ROOT = 12
const ROOT_SPREAD = 3

export function RootSystem({ network }: Props) {
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  const layerOpacity = getLayerOpacity('rootSystem', scrollProgress, mode === 'interactive')

  const geometry = useMemo(() => {
    const positions: number[] = []
    const colors: number[] = []
    const rootColor = new THREE.Color('#6B4E1B')

    for (const tree of network.data.trees) {
      const underground = network.layout.get(tree.id)
      if (!underground) continue

      const trunkBase = new THREE.Vector3(underground.x, 0, underground.z)
      const nodePos = new THREE.Vector3(underground.x, underground.y, underground.z)

      addRootCurve(positions, colors, rootColor, trunkBase, nodePos, 0, 0)

      for (let r = 0; r < ROOT_SPREAD; r++) {
        const angle = (r / ROOT_SPREAD) * Math.PI * 2 + tree.x * 0.3
        const spread = 0.3 + (tree.dbh / 120) * 0.8
        const offsetX = Math.cos(angle) * spread
        const offsetZ = Math.sin(angle) * spread

        addRootCurve(positions, colors, rootColor, trunkBase, nodePos, offsetX, offsetZ)
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3))
    return geo
  }, [network])

  if (layerOpacity <= 0) return null

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.4 * layerOpacity}
        depthWrite={false}
      />
    </lineSegments>
  )
}

function addRootCurve(
  positions: number[],
  colors: number[],
  color: THREE.Color,
  start: THREE.Vector3,
  end: THREE.Vector3,
  offsetX: number,
  offsetZ: number
) {
  const ctrl = new THREE.Vector3(
    (start.x + end.x) / 2 + offsetX,
    start.y * 0.3 + end.y * 0.7,
    (start.z + end.z) / 2 + offsetZ
  )

  const curve = new THREE.QuadraticBezierCurve3(start, ctrl, end)
  const points = curve.getPoints(POINTS_PER_ROOT - 1)

  for (let i = 0; i < points.length - 1; i++) {
    positions.push(
      points[i].x, points[i].y, points[i].z,
      points[i + 1].x, points[i + 1].y, points[i + 1].z
    )

    const t = i / (points.length - 1)
    const alpha = 0.5 - t * 0.3
    colors.push(
      color.r * alpha, color.g * alpha, color.b * alpha,
      color.r * alpha, color.g * alpha, color.b * alpha
    )
  }
}
