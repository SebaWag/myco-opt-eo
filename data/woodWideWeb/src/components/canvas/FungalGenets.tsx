import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ComputedNetwork } from '../../types/network'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

const TUBE_SEGMENTS = 12
const TUBE_RADIUS = 0.03
const TUBE_RADIAL_SEGMENTS = 4

interface GenetMesh {
  genetId: string
  geometry: THREE.BufferGeometry
  color: THREE.Color
}

/**
 * Renders each fungal genet as a set of organic tube geometries
 * along its edge paths. Each genet is a single mesh group coloured
 * by species identity. When genet highlight mode is active, clicking
 * highlights the entire organism.
 */
export function FungalGenets({ network }: Props) {
  const selectedGenetId = useAppStore((s) => s.selectedGenetId)
  const setSelectedGenetId = useAppStore((s) => s.setSelectedGenetId)
  const genetHighlightMode = useAppStore((s) => s.genetHighlightMode)
  const mode = useAppStore((s) => s.mode)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const groupRef = useRef<THREE.Group>(null)

  const layerOpacity = getLayerOpacity('fungalGenets', scrollProgress, mode === 'interactive')

  const genetMeshes: GenetMesh[] = useMemo(() => {
    const meshes: GenetMesh[] = []

    for (const genet of network.data.genets) {
      // Find all edges belonging to this genet
      const genetEdges = network.data.edges.filter(
        e => e.fungalGenetId === genet.id
      )

      if (genetEdges.length === 0) continue

      const geometries: THREE.BufferGeometry[] = []

      for (const edge of genetEdges) {
        const srcPos = network.layout.get(edge.source)
        const tgtPos = network.layout.get(edge.target)
        if (!srcPos || !tgtPos) continue

        const src = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z)
        const tgt = new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z)

        // Control point creates organic curve drooping below both endpoints
        const mid = new THREE.Vector3(
          (src.x + tgt.x) / 2,
          Math.min(src.y, tgt.y) - 1.5,
          (src.z + tgt.z) / 2
        )

        const curve = new THREE.QuadraticBezierCurve3(src, mid, tgt)

        // Tube radius varies slightly with edge weight
        const radius = TUBE_RADIUS * (0.5 + edge.weight * 0.8)

        const tubeGeo = new THREE.TubeGeometry(
          curve,
          TUBE_SEGMENTS,
          radius,
          TUBE_RADIAL_SEGMENTS,
          false
        )

        geometries.push(tubeGeo)
      }

      if (geometries.length > 0) {
        const merged = mergeGeometries(geometries)
        if (merged) {
          meshes.push({
            genetId: genet.id,
            geometry: merged,
            color: new THREE.Color(genet.color),
          })
        }

        // Dispose source geometries
        geometries.forEach(g => g.dispose())
      }
    }

    return meshes
  }, [network])

  // Pulse animation for selected genet, modulated by scroll opacity
  useFrame(({ clock }) => {
    if (!groupRef.current) return

    groupRef.current.children.forEach((child) => {
      if (!(child instanceof THREE.Mesh)) return
      const mat = child.material as THREE.MeshStandardMaterial

      const isSelected = child.userData.genetId === selectedGenetId
      const hasSelection = selectedGenetId !== null && genetHighlightMode

      if (hasSelection) {
        if (isSelected) {
          mat.opacity = (0.7 + Math.sin(clock.elapsedTime * 2) * 0.15) * layerOpacity
          mat.emissiveIntensity = (0.4 + Math.sin(clock.elapsedTime * 2) * 0.2) * layerOpacity
        } else {
          mat.opacity = 0.08 * layerOpacity
          mat.emissiveIntensity = 0
        }
      } else {
        mat.opacity = 0.35 * layerOpacity
        mat.emissiveIntensity = 0.1 * layerOpacity
      }
    })
  })

  const handleClick = (genetId: string) => {
    if (mode !== 'interactive' || !genetHighlightMode) return
    setSelectedGenetId(selectedGenetId === genetId ? null : genetId)
  }

  if (layerOpacity <= 0) return null

  return (
    <group ref={groupRef}>
      {genetMeshes.map(({ genetId, geometry, color }) => (
        <mesh
          key={genetId}
          geometry={geometry}
          userData={{ genetId }}
          onClick={() => handleClick(genetId)}
        >
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={0.1}
            transparent
            opacity={0.35}
            roughness={0.7}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Simple geometry merge — combines multiple buffer geometries
 * into a single geometry by concatenating their position/normal/uv buffers.
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry | null {
  if (geometries.length === 0) return null

  let totalVerts = 0

  for (const geo of geometries) {
    const pos = geo.getAttribute('position')
    if (!pos) continue
    totalVerts += pos.count
  }

  const positions = new Float32Array(totalVerts * 3)
  const normals = new Float32Array(totalVerts * 3)
  const indices: number[] = []

  let vertOffset = 0

  for (const geo of geometries) {
    const pos = geo.getAttribute('position') as THREE.BufferAttribute
    const norm = geo.getAttribute('normal') as THREE.BufferAttribute
    const idx = geo.getIndex()

    if (!pos) continue

    // Copy positions
    for (let i = 0; i < pos.count * 3; i++) {
      positions[vertOffset * 3 + i] = pos.array[i]
    }

    // Copy normals
    if (norm) {
      for (let i = 0; i < norm.count * 3; i++) {
        normals[vertOffset * 3 + i] = norm.array[i]
      }
    }

    // Copy indices with offset
    if (idx) {
      for (let i = 0; i < idx.count; i++) {
        indices.push(idx.array[i] + vertOffset)
      }
    }

    vertOffset += pos.count
  }

  const merged = new THREE.BufferGeometry()
  merged.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  merged.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  if (indices.length > 0) {
    merged.setIndex(indices)
  }

  return merged
}
