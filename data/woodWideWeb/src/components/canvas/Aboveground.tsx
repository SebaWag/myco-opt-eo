import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ComputedNetwork } from '../../types/network'
import { getTreeHeight, getTreeRadius, getCanopyRadius } from '../../utils/graphLayout'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

const TRUNK_COLOR = new THREE.Color('#8B6914')
const TRUNK_DIM = new THREE.Color('#3A2C0A')
const CANOPY_COLOR = new THREE.Color('#2D5016')
const CANOPY_LIGHT = new THREE.Color('#4A7A28')
const CANOPY_DIM = new THREE.Color('#151F0A')
const CANOPY_HIGHLIGHT = new THREE.Color('#6BA832')

export function Aboveground({ network }: Props) {
  const trunkRef = useRef<THREE.InstancedMesh>(null)
  const canopyRef = useRef<THREE.InstancedMesh>(null)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  const trees = network.data.trees

  useEffect(() => {
    const dummy = new THREE.Object3D()

    if (!trunkRef.current || !canopyRef.current) return

    trees.forEach((tree, i) => {
      const pos = network.layout.get(tree.id)
      if (!pos) return

      const height = getTreeHeight(tree.dbh)
      const radius = getTreeRadius(tree.dbh)

      // Trunk
      dummy.position.set(pos.x, height / 2, pos.z)
      dummy.scale.set(radius, height, radius)
      dummy.updateMatrix()
      trunkRef.current!.setMatrixAt(i, dummy.matrix)
      trunkRef.current!.setColorAt(i, TRUNK_COLOR)

      // Canopy
      const canopyR = getCanopyRadius(tree.dbh)
      dummy.position.set(pos.x, height * 0.75, pos.z)
      dummy.scale.set(canopyR, canopyR * 1.5, canopyR)
      dummy.updateMatrix()
      canopyRef.current!.setMatrixAt(i, dummy.matrix)
      canopyRef.current!.setColorAt(
        i,
        tree.isMotherTree ? CANOPY_LIGHT : CANOPY_COLOR
      )
    })

    trunkRef.current.instanceMatrix.needsUpdate = true
    if (trunkRef.current.instanceColor) trunkRef.current.instanceColor.needsUpdate = true
    canopyRef.current.instanceMatrix.needsUpdate = true
    if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true
  }, [trees, network.layout])

  // During "Hub Trees" section, dim non-hub trees and brighten hub trees
  const tmpColor = useRef(new THREE.Color())

  useFrame(() => {
    if (!trunkRef.current || !canopyRef.current) return

    const highlight = getLayerOpacity('hubTreeHighlight', scrollProgress, mode === 'interactive')

    // Only update instance colors when highlight is active or transitioning
    if (highlight <= 0) return

    trees.forEach((tree, i) => {
      if (tree.isMotherTree) {
        // Hub trees: lerp toward bright highlight
        tmpColor.current.copy(CANOPY_LIGHT).lerp(CANOPY_HIGHLIGHT, highlight)
        canopyRef.current!.setColorAt(i, tmpColor.current)

        tmpColor.current.copy(TRUNK_COLOR) // trunk stays normal
        trunkRef.current!.setColorAt(i, tmpColor.current)
      } else {
        // Non-hub trees: lerp toward dimmed
        tmpColor.current.copy(CANOPY_COLOR).lerp(CANOPY_DIM, highlight * 0.7)
        canopyRef.current!.setColorAt(i, tmpColor.current)

        tmpColor.current.copy(TRUNK_COLOR).lerp(TRUNK_DIM, highlight * 0.7)
        trunkRef.current!.setColorAt(i, tmpColor.current)
      }
    })

    if (trunkRef.current.instanceColor) trunkRef.current.instanceColor.needsUpdate = true
    if (canopyRef.current.instanceColor) canopyRef.current.instanceColor.needsUpdate = true
  })

  return (
    <>
      <instancedMesh ref={trunkRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <cylinderGeometry args={[1, 1, 1, 8]} />
        <meshStandardMaterial roughness={0.9} />
      </instancedMesh>
      <instancedMesh ref={canopyRef} args={[undefined, undefined, trees.length]} frustumCulled={false}>
        <coneGeometry args={[1, 1, 8]} />
        <meshStandardMaterial roughness={0.8} />
      </instancedMesh>
    </>
  )
}
