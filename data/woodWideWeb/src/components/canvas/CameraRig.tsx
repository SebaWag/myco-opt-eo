import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import { useAppStore } from '../../stores/appStore'
import { lerpV3, smoothstep } from '../../utils/easing'
import type { ComputedNetwork } from '../../types/network'

// 7-section scroll keyframes: [progress, position, lookAt]
const KEYFRAMES: [number, [number, number, number], [number, number, number]][] = [
  [0.00, [0, 20, 35],     [0, 5, 0]],      // 1. Above canopy — panoramic forest view
  [0.14, [0, 8, 22],      [0, 0, 0]],       // 2. Descending — network about to be revealed
  [0.28, [8, 0, 14],      [0, -2, 0]],      // 3. At soil line — economy/nutrient flows visible
  [0.42, [6, -2, 10],     [0, -3, 0]],      // 3b. Still underground — carbon pump content
  [0.52, [12, 14, 20],    [0, -1, 0]],      // 4. Elevated wide — hub trees highlighted, network visible below
  [0.62, [3, -3, 6],      [0, -3, 0]],      // 5. Close underground — kin recognition, individual connections
  [0.74, [-4, -1, 12],    [0, -2, 0]],      // 6. Wide view — see the whole network, confidence
  [0.85, [0, -2, 8],      [0, -2, 0]],      // 7. Final — ready to explore
  [1.00, [0, -2, 6],      [0, -2, 0]],      // Hold at end
]

function getKeyframeAt(progress: number): {
  position: [number, number, number]
  lookAt: [number, number, number]
} {
  let lower = KEYFRAMES[0]
  let upper = KEYFRAMES[KEYFRAMES.length - 1]

  for (let i = 0; i < KEYFRAMES.length - 1; i++) {
    if (progress >= KEYFRAMES[i][0] && progress <= KEYFRAMES[i + 1][0]) {
      lower = KEYFRAMES[i]
      upper = KEYFRAMES[i + 1]
      break
    }
  }

  const range = upper[0] - lower[0]
  const t = range > 0 ? smoothstep(0, 1, (progress - lower[0]) / range) : 0

  return {
    position: lerpV3(lower[1], upper[1], t),
    lookAt: lerpV3(lower[2], upper[2], t),
  }
}

interface CameraRigProps {
  network?: ComputedNetwork
}

export function CameraRig({ network }: CameraRigProps) {
  const mode = useAppStore((s) => s.mode)
  const scrollProgress = useAppStore((s) => s.scrollProgress)
  const selectedNodeId = useAppStore((s) => s.selectedNodeId)
  const setLastNarrativeCameraPos = useAppStore((s) => s.setLastNarrativeCameraPos)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const controlsRef = useRef<any>(null)
  const { camera } = useThree()
  const lookAtTarget = useRef(new THREE.Vector3())
  const flyStartTarget = useRef(new THREE.Vector3())
  const flyEndTarget = useRef(new THREE.Vector3())
  const flyStartCam = useRef(new THREE.Vector3())
  const flyEndCam = useRef(new THREE.Vector3())
  const flyProgress = useRef(1) // 1 = not flying
  const prevSelectedId = useRef<string | null>(null)
  const FLY_DURATION = 1.2 // seconds

  useFrame((_, delta) => {
    if (mode === 'narrative') {
      const { position, lookAt } = getKeyframeAt(scrollProgress)

      camera.position.lerp(
        new THREE.Vector3(...position),
        0.05
      )
      lookAtTarget.current.lerp(
        new THREE.Vector3(...lookAt),
        0.05
      )
      camera.lookAt(lookAtTarget.current)
      setLastNarrativeCameraPos([camera.position.x, camera.position.y, camera.position.z])
      return
    }

    // Interactive mode: fly to selected tree when selection changes
    if (!controlsRef.current || !network) return
    const controls = controlsRef.current

    if (selectedNodeId && selectedNodeId !== prevSelectedId.current) {
      const pos = network.layout.get(selectedNodeId)
      if (pos) {
        // Capture current positions as start
        flyStartTarget.current.copy(controls.target)
        flyStartCam.current.copy(camera.position)
        // Set destinations
        flyEndTarget.current.set(pos.x, pos.y, pos.z)
        flyEndCam.current.set(pos.x + 2, pos.y + 2, pos.z + 5)
        // Start the timed animation
        flyProgress.current = 0
      }
      prevSelectedId.current = selectedNodeId
    }

    // Time-based fly animation — runs for exactly FLY_DURATION then stops
    if (flyProgress.current < 1) {
      flyProgress.current = Math.min(1, flyProgress.current + delta / FLY_DURATION)
      const t = smoothstep(0, 1, flyProgress.current)

      controls.target.lerpVectors(flyStartTarget.current, flyEndTarget.current, t)
      camera.position.lerpVectors(flyStartCam.current, flyEndCam.current, t)
      controls.update()
    }
  })

  // Set initial target imperatively on mount — NOT as a JSX prop,
  // because R3F re-applies the target prop on every re-render,
  // which would reset the fly-to lerp.
  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.target.set(0, -2, 0)
      controlsRef.current.update()
    }
  }, [])

  useEffect(() => {
    if (controlsRef.current) {
      controlsRef.current.enabled = mode === 'interactive'
    }
  }, [mode])

  return (
    <OrbitControls
      ref={controlsRef}
      enableDamping
      dampingFactor={0.05}
      minDistance={3}
      maxDistance={50}
      enabled={mode === 'interactive'}
    />
  )
}
