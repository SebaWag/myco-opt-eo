import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import type { ComputedNetwork } from '../../types/network'
import { useNutrientFlow } from '../../hooks/useNutrientFlow'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

interface Props {
  network: ComputedNetwork
}

export function NutrientParticles({ network }: Props) {
  const { meshRef, particleCount, colorArr } = useNutrientFlow(network)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  const layerOpacity = getLayerOpacity('nutrientParticles', scrollProgress, mode === 'interactive')

  // Set instance colors and animate opacity every frame.
  // We always render the mesh (never return null) so that
  // the instanceColor buffer stays attached.
  useFrame(() => {
    if (!meshRef.current) return
    const mesh = meshRef.current

    // Attach instance color buffer if not yet set
    if (!mesh.instanceColor) {
      mesh.instanceColor = new THREE.InstancedBufferAttribute(
        colorArr.current,
        3
      )
    }

    const mat = mesh.material as THREE.MeshBasicMaterial
    mat.opacity = layerOpacity
    mat.transparent = true
    mat.visible = layerOpacity > 0
  })

  return (
    <instancedMesh ref={meshRef} args={[undefined, undefined, particleCount]} frustumCulled={false}>
      <sphereGeometry args={[1, 6, 6]} />
      <meshBasicMaterial toneMapped={false} transparent opacity={0} />
    </instancedMesh>
  )
}
