import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame } from '@react-three/fiber'
import { useAppStore } from '../../stores/appStore'
import { getLayerOpacity } from '../../utils/scrollLayers'

const PLOT_SIZE = 60

interface HorizonProps {
  yTop: number
  yBottom: number
  color: string
  baseOpacity: number
  layerOpacity: number
}

function SoilHorizon({ yTop, yBottom, color, baseOpacity, layerOpacity }: HorizonProps) {
  const thickness = yTop - yBottom

  return (
    <mesh position={[0, yTop - thickness / 2, 0]}>
      <boxGeometry args={[PLOT_SIZE, thickness, PLOT_SIZE]} />
      <meshBasicMaterial
        color={color}
        transparent
        opacity={baseOpacity * layerOpacity}
        side={THREE.BackSide}
        depthWrite={false}
      />
    </mesh>
  )
}

export function SoilVolume() {
  const surfaceRef = useRef<THREE.Mesh>(null)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const mode = useAppStore((s) => s.mode)

  const layerOpacity = getLayerOpacity('soilVolume', scrollProgress, mode === 'interactive')

  useFrame(({ clock }) => {
    if (surfaceRef.current) {
      const mat = surfaceRef.current.material as THREE.MeshBasicMaterial
      mat.opacity = (0.15 + Math.sin(clock.elapsedTime * 0.5) * 0.03) * layerOpacity
    }
  })

  if (layerOpacity <= 0) return null

  return (
    <group>
      {/* Surface plane — only visible from above (FrontSide) so it doesn't
          appear as a bright disk when viewed from underground */}
      <mesh
        ref={surfaceRef}
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, 0, 0]}
      >
        <planeGeometry args={[PLOT_SIZE, PLOT_SIZE]} />
        <meshBasicMaterial
          color="#1A1408"
          transparent
          opacity={0.15 * layerOpacity}
          side={THREE.FrontSide}
          depthWrite={false}
        />
      </mesh>

      <SoilHorizon yTop={0} yBottom={-0.8} color="#2A1F10" baseOpacity={0.06} layerOpacity={layerOpacity} />
      <SoilHorizon yTop={-0.8} yBottom={-2.5} color="#1F1A0F" baseOpacity={0.04} layerOpacity={layerOpacity} />
      <SoilHorizon yTop={-2.5} yBottom={-5.5} color="#1A140C" baseOpacity={0.03} layerOpacity={layerOpacity} />

      <HorizonLine y={-0.8} opacity={layerOpacity} />
      <HorizonLine y={-2.5} opacity={layerOpacity} />
    </group>
  )
}

function HorizonLine({ y, opacity }: { y: number; opacity: number }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, y, 0]}>
      <planeGeometry args={[PLOT_SIZE, PLOT_SIZE]} />
      <meshBasicMaterial
        color="#3A2A18"
        transparent
        opacity={0.05 * opacity}
        side={THREE.FrontSide}
        depthWrite={false}
      />
    </mesh>
  )
}
