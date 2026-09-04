import { useRef, useMemo, useEffect } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { ComputedNetwork, NetworkEdge, EdgeDirection } from '../types/network'
import { useAppStore, type Season } from '../stores/appStore'
import { NUTRIENT_COLORS_THREE, type NutrientType } from '../utils/colors'
import { getLayerOpacity } from '../utils/scrollLayers'

const MAX_PARTICLES = 2000

interface Particle {
  edgeIndex: number
  progress: number // 0-1 along edge
  speed: number
  nutrientType: NutrientType
  reversed: boolean // true = particle travels target→source
}

/**
 * Season affects carbon flow direction and overall magnitude.
 * Based on Simard 1997: in summer, shaded understorey fir receives
 * net carbon from sunlit neighbours. In autumn, flow reverses.
 */
function getSeasonModifiers(season: Season): { directionBias: number; magnitude: number } {
  switch (season) {
    case 'spring':
      return { directionBias: 0.2, magnitude: 0.7 }
    case 'summer':
      return { directionBias: 0.0, magnitude: 1.0 }
    case 'autumn':
      return { directionBias: 0.8, magnitude: 0.8 }
    case 'winter':
      return { directionBias: 0.5, magnitude: 0.3 }
  }
}

/**
 * Determine if a particle should travel in reverse based on
 * the edge's direction field, nutrient type, and season.
 */
function shouldReverse(
  direction: EdgeDirection,
  nutrientType: NutrientType,
  season: Season
): boolean {
  const { directionBias } = getSeasonModifiers(season)

  switch (direction) {
    case 'treeToFungus':
      if (nutrientType === 'carbon') {
        return Math.random() < directionBias
      }
      return false
    case 'fungusToTree':
      return true
    case 'bidirectional':
      return Math.random() < 0.5
  }
}

function initParticles(
  count: number,
  edgeData: { nutrientType: NutrientType; direction: EdgeDirection }[],
  season: Season
): Particle[] {
  const particles: Particle[] = []
  for (let i = 0; i < count; i++) {
    const edgeIndex = Math.floor(Math.random() * edgeData.length)
    const edge = edgeData[edgeIndex]
    particles.push({
      edgeIndex,
      progress: Math.random(),
      speed: 0.15 + Math.random() * 0.3,
      nutrientType: edge.nutrientType,
      reversed: shouldReverse(edge.direction, edge.nutrientType, season),
    })
  }
  return particles
}

export function useNutrientFlow(network: ComputedNetwork | null) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const particlesRef = useRef<Particle[]>([])
  const dummy = useMemo(() => new THREE.Object3D(), [])
  const colorArr = useRef(new Float32Array(MAX_PARTICLES * 3))

  const nutrientFilters = useAppStore((s) => s.nutrientFilters)
  const particleSpeed = useAppStore((s) => s.particleSpeed)
  const isMobile = useAppStore((s) => s.isMobile)
  const season = useAppStore((s) => s.season)
  const kinHighlightActive = useAppStore((s) => s.kinHighlightActive)

  const activeParticleCount = isMobile ? 400 : MAX_PARTICLES

  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  // Set of mother tree IDs for kin edge detection
  const motherTreeIds = useMemo(() => {
    if (!network) return new Set<string>()
    return new Set(network.data.trees.filter((t) => t.isMotherTree).map((t) => t.id))
  }, [network])

  // Build edge lookup for positions
  const edgeData = useMemo(() => {
    if (!network) return []
    return network.data.edges.map((edge: NetworkEdge) => {
      const srcPos = network.layout.get(edge.source)
      const tgtPos = network.layout.get(edge.target)
      if (!srcPos || !tgtPos) return null

      const midX = (srcPos.x + tgtPos.x) / 2
      const midY = Math.min(srcPos.y, tgtPos.y) - 1.5
      const midZ = (srcPos.z + tgtPos.z) / 2

      return {
        src: new THREE.Vector3(srcPos.x, srcPos.y, srcPos.z),
        ctrl: new THREE.Vector3(midX, midY, midZ),
        tgt: new THREE.Vector3(tgtPos.x, tgtPos.y, tgtPos.z),
        nutrientType: edge.nutrientType,
        direction: edge.direction,
        weight: edge.weight,
        isKinEdge: motherTreeIds.has(edge.source) || motherTreeIds.has(edge.target),
      }
    }).filter(Boolean) as {
      src: THREE.Vector3
      ctrl: THREE.Vector3
      tgt: THREE.Vector3
      nutrientType: NutrientType
      direction: EdgeDirection
      weight: number
      isKinEdge: boolean
    }[]
  }, [network, motherTreeIds])

  // Initialize particles in an effect (side effect with Math.random)
  useEffect(() => {
    if (edgeData.length === 0) return
    particlesRef.current = initParticles(activeParticleCount, edgeData, season)
  }, [edgeData, activeParticleCount, season])

  useFrame((_, delta) => {
    const mesh = meshRef.current
    if (!mesh || edgeData.length === 0) return

    const particles = particlesRef.current
    const colors = colorArr.current
    const { magnitude } = getSeasonModifiers(season)
    // Kin highlight: active during narrative scroll section OR when toggled on in interactive mode
    const kinHighlight = kinHighlightActive
      ? 1
      : getLayerOpacity('kinHighlight', scrollProgress, false)

    for (let i = 0; i < particles.length; i++) {
      const p = particles[i]
      const edge = edgeData[p.edgeIndex]

      // Check filter — also hide non-kin particles when kin highlight is fully active
      const kinHidden = kinHighlight >= 1 && !edge.isKinEdge
      if (!nutrientFilters[p.nutrientType] || kinHidden) {
        dummy.position.set(0, -100, 0)
        dummy.scale.setScalar(0)
        dummy.updateMatrix()
        mesh.setMatrixAt(i, dummy.matrix)
        continue
      }

      // Advance with seasonal magnitude
      p.progress += p.speed * particleSpeed * magnitude * delta
      if (p.progress >= 1) {
        p.progress = 0
        p.edgeIndex = Math.floor(Math.random() * edgeData.length)
        const newEdge = edgeData[p.edgeIndex]
        p.nutrientType = newEdge.nutrientType
        p.reversed = shouldReverse(newEdge.direction, newEdge.nutrientType, season)
      }

      // Quadratic bezier position — reverse if needed
      const t = p.reversed ? 1 - p.progress : p.progress
      const t1 = 1 - t
      const x = t1 * t1 * edge.src.x + 2 * t1 * t * edge.ctrl.x + t * t * edge.tgt.x
      const y = t1 * t1 * edge.src.y + 2 * t1 * t * edge.ctrl.y + t * t * edge.tgt.y
      const z = t1 * t1 * edge.src.z + 2 * t1 * t * edge.ctrl.z + t * t * edge.tgt.z

      dummy.position.set(x, y, z)

      // Scale: kin edges get larger particles, non-kin shrink, during kin section
      const baseScale = 0.04 + Math.sin(p.progress * Math.PI) * 0.03
      let scale: number
      if (kinHighlight > 0) {
        if (edge.isKinEdge) {
          // Kin edges: stay at normal size
          scale = baseScale
        } else {
          // Non-kin edges: shrink to ¼ normal size
          const dimScale = 0.01 + Math.sin(p.progress * Math.PI) * 0.0075
          scale = baseScale + (dimScale - baseScale) * kinHighlight
        }
      } else {
        scale = baseScale
      }
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      mesh.setMatrixAt(i, dummy.matrix)

      // Color
      const color = NUTRIENT_COLORS_THREE[p.nutrientType]
      colors[i * 3] = color.r
      colors[i * 3 + 1] = color.g
      colors[i * 3 + 2] = color.b
    }

    mesh.instanceMatrix.needsUpdate = true
    if (mesh.instanceColor) {
      mesh.instanceColor.needsUpdate = true
    }
  })

  return { meshRef, particleCount: activeParticleCount, colorArr }
}
