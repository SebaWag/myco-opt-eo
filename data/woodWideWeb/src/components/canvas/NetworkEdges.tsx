import { useMemo, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ComputedNetwork, EvidenceConfidence } from '../../types/network'
import { NUTRIENT_COLORS_THREE } from '../../utils/colors'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

const POINTS_PER_EDGE = 20

const CONFIDENCE_COLORS: Record<EvidenceConfidence, THREE.Color> = {
  established: new THREE.Color('#22C55E'),
  demonstrated: new THREE.Color('#F59E0B'),
  contested: new THREE.Color('#EF4444'),
}

export function NetworkEdges({ network }: Props) {
  const lineRef = useRef<THREE.LineSegments>(null)
  const confidenceOverlay = useAppStore((s) => s.confidenceOverlay)
  const kinHighlightActive = useAppStore((s) => s.kinHighlightActive)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  const layerOpacity = getLayerOpacity('networkEdges', scrollProgress, mode === 'interactive')

  // Set of mother tree IDs for kin edge detection
  const motherTreeIds = useMemo(() => {
    return new Set(network.data.trees.filter((t) => t.isMotherTree).map((t) => t.id))
  }, [network.data.trees])

  const { geometry, confidenceGeometry, kinGeometry, segmentsPerEdge } = useMemo(() => {
    const edges = network.data.edges
    const segsPerEdge = POINTS_PER_EDGE - 1
    const totalSegments = edges.length * segsPerEdge
    const positions = new Float32Array(totalSegments * 6)
    const nutrientColors = new Float32Array(totalSegments * 6)
    const confColors = new Float32Array(totalSegments * 6)
    const kinColors = new Float32Array(totalSegments * 6)

    let offset = 0
    for (const edge of edges) {
      const srcPos = network.layout.get(edge.source)
      const tgtPos = network.layout.get(edge.target)
      if (!srcPos || !tgtPos) continue

      const src = new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z)
      const tgt = new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z)
      const mid = new THREE.Vector3(
        (src.x + tgt.x) / 2,
        Math.min(src.y, tgt.y) - 1.5,
        (src.z + tgt.z) / 2
      )

      const curve = new THREE.QuadraticBezierCurve3(src, mid, tgt)
      const points = curve.getPoints(POINTS_PER_EDGE - 1)
      const nutrientColor = NUTRIENT_COLORS_THREE[edge.nutrientType]
      const confColor = CONFIDENCE_COLORS[edge.confidence]
      const isKin = motherTreeIds.has(edge.source) || motherTreeIds.has(edge.target)

      for (let j = 0; j < points.length - 1; j++) {
        const i6 = offset * 6
        positions[i6] = points[j].x
        positions[i6 + 1] = points[j].y
        positions[i6 + 2] = points[j].z
        positions[i6 + 3] = points[j + 1].x
        positions[i6 + 4] = points[j + 1].y
        positions[i6 + 5] = points[j + 1].z

        const alpha = 0.3 + edge.weight * 0.5
        nutrientColors[i6] = nutrientColor.r * alpha
        nutrientColors[i6 + 1] = nutrientColor.g * alpha
        nutrientColors[i6 + 2] = nutrientColor.b * alpha
        nutrientColors[i6 + 3] = nutrientColor.r * alpha
        nutrientColors[i6 + 4] = nutrientColor.g * alpha
        nutrientColors[i6 + 5] = nutrientColor.b * alpha

        const confAlpha = edge.confidence === 'contested' ? 0.6 : 0.5 + edge.weight * 0.3
        confColors[i6] = confColor.r * confAlpha
        confColors[i6 + 1] = confColor.g * confAlpha
        confColors[i6 + 2] = confColor.b * confAlpha
        confColors[i6 + 3] = confColor.r * confAlpha
        confColors[i6 + 4] = confColor.g * confAlpha
        confColors[i6 + 5] = confColor.b * confAlpha

        // Kin mode: bright for kin edges, hidden for non-kin
        const kinAlpha = isKin ? 0.6 + edge.weight * 0.4 : 0
        kinColors[i6] = nutrientColor.r * kinAlpha
        kinColors[i6 + 1] = nutrientColor.g * kinAlpha
        kinColors[i6 + 2] = nutrientColor.b * kinAlpha
        kinColors[i6 + 3] = nutrientColor.r * kinAlpha
        kinColors[i6 + 4] = nutrientColor.g * kinAlpha
        kinColors[i6 + 5] = nutrientColor.b * kinAlpha

        offset++
      }
    }

    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(nutrientColors, 3))

    const confGeo = new THREE.BufferGeometry()
    confGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    confGeo.setAttribute('color', new THREE.BufferAttribute(confColors, 3))

    const kinGeo = new THREE.BufferGeometry()
    kinGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    kinGeo.setAttribute('color', new THREE.BufferAttribute(kinColors, 3))

    return { geometry: geo, confidenceGeometry: confGeo, kinGeometry: kinGeo, segmentsPerEdge: segsPerEdge }
  }, [network, motherTreeIds])

  // Determine which geometry to use based on active overlays
  const kinHighlightFromScroll = getLayerOpacity('kinHighlight', scrollProgress, false)
  const kinActive = kinHighlightActive || kinHighlightFromScroll > 0.5

  const activeGeometry = confidenceOverlay
    ? confidenceGeometry
    : kinActive
      ? kinGeometry
      : geometry

  useFrame(({ clock }) => {
    if (!lineRef.current) return
    const mat = lineRef.current.material as THREE.LineBasicMaterial
    mat.opacity = (0.5 + Math.sin(clock.elapsedTime * 0.8) * 0.15) * layerOpacity
  })

  if (layerOpacity <= 0) return null

  return (
    <lineSegments
      ref={lineRef}
      geometry={activeGeometry}
    >
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.5 * layerOpacity}
        depthWrite={false}
      />
    </lineSegments>
  )
}
