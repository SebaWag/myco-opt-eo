import { useEffect, useRef, useCallback, useMemo } from 'react'
import * as THREE from 'three'
import { useFrame, type ThreeEvent } from '@react-three/fiber'
import type { ComputedNetwork } from '../../types/network'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

// Shared geometry for click targets — larger on mobile for easier tapping
const hitSphere = new THREE.SphereGeometry(0.3, 8, 8)
const hitSphereMobile = new THREE.SphereGeometry(0.6, 8, 8)
const invisibleMat = new THREE.MeshBasicMaterial({ visible: false })

export function NetworkNodes({ network }: Props) {
  const meshRef = useRef<THREE.InstancedMesh>(null)
  const setSelectedNodeId = useAppStore((s) => s.setSelectedNodeId)
  const setHoveredNodeId = useAppStore((s) => s.setHoveredNodeId)
  const triggerDefenceSignal = useAppStore((s) => s.triggerDefenceSignal)
  const mode = useAppStore((s) => s.mode)
  const isMobile = useAppStore((s) => s.isMobile)
  const scrollProgress = useAppStore((s) => s.scrollProgress)

  const layerOpacity = getLayerOpacity('networkNodes', scrollProgress, mode === 'interactive')

  const trees = network.data.trees

  // Build click target positions
  const treePositions = useMemo(() => {
    return trees.map((tree) => {
      const pos = network.layout.get(tree.id)
      return pos ? [pos.x, pos.y, pos.z] as [number, number, number] : null
    })
  }, [trees, network.layout])

  useEffect(() => {
    if (!meshRef.current) return
    const dummy = new THREE.Object3D()
    const defaultColor = new THREE.Color('#A08850')
    const motherColor = new THREE.Color('#FFB800')

    trees.forEach((tree, i) => {
      const pos = network.layout.get(tree.id)
      if (!pos) return

      const scale = tree.isMotherTree
        ? 0.06 + (tree.connections / network.maxDegree) * 0.06
        : 0.03 + (tree.connections / network.maxDegree) * 0.04

      dummy.position.set(pos.x, pos.y, pos.z)
      dummy.scale.setScalar(scale)
      dummy.updateMatrix()
      meshRef.current!.setMatrixAt(i, dummy.matrix)
      meshRef.current!.setColorAt(i, tree.isMotherTree ? motherColor : defaultColor)
    })

    meshRef.current.instanceMatrix.needsUpdate = true
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true
  }, [trees, network.layout, network.maxDegree])

  // Animate opacity and visibility based on scroll
  useFrame(() => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.opacity = layerOpacity
    mat.transparent = true
    mat.visible = layerOpacity > 0
  })

  // Click handler — fly camera to this tree (+ show info on mobile)
  const handleTreeClick = useCallback(
    (treeIndex: number) => (e: ThreeEvent<MouseEvent>) => {
      if (mode !== 'interactive') return
      e.stopPropagation()
      const tree = trees[treeIndex]
      setSelectedNodeId(tree.id)
      // On mobile, tap also shows info (no hover available)
      if (isMobile) setHoveredNodeId(tree.id)
      if (e.nativeEvent.shiftKey) {
        triggerDefenceSignal(tree.id)
      }
    },
    [mode, isMobile, trees, setSelectedNodeId, setHoveredNodeId, triggerDefenceSignal]
  )

  // Hover handler — show info panel
  const handlePointerOver = useCallback(
    (treeIndex: number) => (e: ThreeEvent<PointerEvent>) => {
      if (mode !== 'interactive') return
      e.stopPropagation()
      setHoveredNodeId(trees[treeIndex].id)
    },
    [mode, trees, setHoveredNodeId]
  )

  const handlePointerOut = useCallback(
    () => {
      setHoveredNodeId(null)
    },
    [setHoveredNodeId]
  )

  return (
    <>
      {/* Visual nodes (InstancedMesh for performance) */}
      <instancedMesh
        ref={meshRef}
        args={[undefined, undefined, trees.length]}
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 16, 16]} />
        <meshStandardMaterial
          emissive="#FFB800"
          emissiveIntensity={0.2}
          roughness={0.6}
          transparent
          opacity={0}
        />
      </instancedMesh>

      {/* Invisible hit targets (regular meshes — reliable R3F events) */}
      {mode === 'interactive' && treePositions.map((pos, i) =>
        pos ? (
          <mesh
            key={trees[i].id}
            position={pos}
            geometry={isMobile ? hitSphereMobile : hitSphere}
            material={invisibleMat}
            onClick={handleTreeClick(i)}
            onPointerOver={handlePointerOver(i)}
            onPointerOut={handlePointerOut}
          />
        ) : null
      )}
    </>
  )
}
