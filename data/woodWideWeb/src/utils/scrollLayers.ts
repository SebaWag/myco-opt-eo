import { clamp } from './easing'

/**
 * Scroll progress thresholds for progressive layer reveal.
 * Each layer fades in over a range of scroll progress.
 * In interactive mode, all layers are fully visible.
 *
 * Sections vary in height (some > 100vh), so thresholds are tuned
 * empirically rather than assuming equal section sizes:
 *
 * Section 1 (~0.00-0.10): What You See — canopy only
 * Section 2 (~0.10-0.22): Network Revealed — soil, roots, edges, nodes, genets
 * Section 3 (~0.22-0.40): Living Economy — nutrient particles appear
 * Section 4 (~0.40-0.52): Hub Trees — mother tree glow pulses
 * Section 5-7 (~0.52+):   Everything visible
 */

interface LayerThreshold {
  fadeIn: number    // scroll progress where fade starts
  fullAt: number    // scroll progress where fully visible
  fadeOut?: number   // scroll progress where fade out starts (optional)
  goneAt?: number    // scroll progress where fully hidden again (optional)
}

const LAYERS = {
  soilVolume:       { fadeIn: 0.04, fullAt: 0.10 },
  rootSystem:       { fadeIn: 0.05, fullAt: 0.12 },
  networkEdges:     { fadeIn: 0.06, fullAt: 0.14 },
  networkNodes:     { fadeIn: 0.07, fullAt: 0.14 },
  fungalGenets:     { fadeIn: 0.08, fullAt: 0.16 },
  nutrientParticles:{ fadeIn: 0.18, fullAt: 0.28 },
  hubTreeHighlight: { fadeIn: 0.48, fullAt: 0.55, fadeOut: 0.58, goneAt: 0.62 },
  kinHighlight:     { fadeIn: 0.50, fullAt: 0.56, fadeOut: 0.66, goneAt: 0.72 },
} as const satisfies Record<string, LayerThreshold>

export type LayerName = keyof typeof LAYERS

/**
 * Returns 0-1 opacity for a layer based on scroll progress.
 * In interactive mode, always returns 1.
 */
export function getLayerOpacity(
  layer: LayerName,
  scrollProgress: number,
  isInteractive: boolean
): number {
  if (isInteractive) return 1

  const t: LayerThreshold = LAYERS[layer]
  if (scrollProgress <= t.fadeIn) return 0

  // Fade out if the layer has a fadeOut threshold
  if (t.fadeOut != null && t.goneAt != null) {
    if (scrollProgress >= t.goneAt) return 0
    if (scrollProgress >= t.fadeOut) {
      return clamp(1 - (scrollProgress - t.fadeOut) / (t.goneAt - t.fadeOut), 0, 1)
    }
  }

  if (scrollProgress >= t.fullAt) return 1
  return clamp((scrollProgress - t.fadeIn) / (t.fullAt - t.fadeIn), 0, 1)
}
