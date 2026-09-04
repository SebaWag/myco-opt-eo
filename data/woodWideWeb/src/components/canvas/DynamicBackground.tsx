import { useRef } from 'react'
import * as THREE from 'three'
import { useFrame, useThree } from '@react-three/fiber'

/**
 * Smoothly transitions the scene background and fog color
 * based on whether the camera is above or below ground (y = 0).
 *
 * Above ground: cooler, slightly blue-grey atmosphere
 * Below ground: warm, earthy dark brown
 * The blend uses the camera Y with a soft transition zone around the soil line.
 */

const ABOVE_BG = new THREE.Color('#2A3A4E')   // lighter cool blue
const BELOW_BG = new THREE.Color('#0A0806')   // warm dark brown (original)
const ABOVE_FOG = new THREE.Color('#2A3A4E')
const BELOW_FOG = new THREE.Color('#0A0806')

// Transition zone: fully underground at y=-2, fully above at y=4
const TRANSITION_LOW = -2
const TRANSITION_HIGH = 4

function clamp01(v: number) {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

export function DynamicBackground() {
  const { scene } = useThree()
  const bgColor = useRef(new THREE.Color())
  const fogColor = useRef(new THREE.Color())

  useFrame(({ camera }) => {
    const t = clamp01((camera.position.y - TRANSITION_LOW) / (TRANSITION_HIGH - TRANSITION_LOW))

    bgColor.current.copy(BELOW_BG).lerp(ABOVE_BG, t)
    if (scene.background instanceof THREE.Color) {
      scene.background.lerp(bgColor.current, 0.08)
    }

    if (scene.fog && 'color' in scene.fog) {
      fogColor.current.copy(BELOW_FOG).lerp(ABOVE_FOG, t)
      ;(scene.fog as THREE.Fog).color.lerp(fogColor.current, 0.08)
    }
  })

  return null
}
