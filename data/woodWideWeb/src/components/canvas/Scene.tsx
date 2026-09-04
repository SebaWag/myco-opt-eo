import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import { SoilVolume } from './SoilVolume'
import { RootSystem } from './RootSystem'
import { Aboveground } from './Aboveground'
import { Underground } from './Underground'
import { CameraRig } from './CameraRig'
import { DynamicBackground } from './DynamicBackground'
import type { ComputedNetwork } from '../../types/network'
import { useAppStore } from '../../stores/appStore'

interface Props {
  network: ComputedNetwork
}

function SceneContent({ network }: Props) {
  return (
    <>
      <CameraRig network={network} />
      <DynamicBackground />

      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <directionalLight position={[10, 20, 10]} intensity={0.5} color="#FFE8CC" />

      {/* Fog for depth */}
      <fog attach="fog" args={['#0A0806', 15, 55]} />

      <SoilVolume />
      <Aboveground network={network} />
      <RootSystem network={network} />
      <Underground network={network} />

      {/* Postprocessing */}
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.7}
          luminanceSmoothing={0.3}
          intensity={0.6}
          mipmapBlur
        />
      </EffectComposer>
    </>
  )
}

export function Scene({ network }: Props) {
  const isMobile = useAppStore((s) => s.isMobile)
  const setHoveredNodeId = useAppStore((s) => s.setHoveredNodeId)

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: 0,
    }}>
      <Canvas
        camera={{ position: [0, 20, 35], fov: 50, near: 0.1, far: 100 }}
        onPointerMissed={() => setHoveredNodeId(null)}
        gl={{
          antialias: !isMobile,
          toneMapping: 3, // ACESFilmic
          toneMappingExposure: 1.2,
        }}
        dpr={isMobile ? 1 : [1, 2]}
      >
        <color attach="background" args={['#0A0806']} />
        <Suspense fallback={null}>
          <SceneContent network={network} />
        </Suspense>
      </Canvas>
    </div>
  )
}
