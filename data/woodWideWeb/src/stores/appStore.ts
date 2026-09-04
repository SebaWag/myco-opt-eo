import { create } from 'zustand'
import type { NutrientType } from '../utils/colors'

export type AppMode = 'narrative' | 'interactive'
export type Season = 'spring' | 'summer' | 'autumn' | 'winter'

interface AppState {
  mode: AppMode
  setMode: (mode: AppMode) => void

  scrollProgress: number
  setScrollProgress: (progress: number) => void

  selectedNodeId: string | null
  setSelectedNodeId: (id: string | null) => void

  hoveredNodeId: string | null
  setHoveredNodeId: (id: string | null) => void

  nutrientFilters: Record<NutrientType, boolean>
  toggleNutrient: (type: NutrientType) => void

  particleSpeed: number
  setParticleSpeed: (speed: number) => void

  isMobile: boolean
  setIsMobile: (mobile: boolean) => void

  showSourcesPanel: boolean
  setShowSourcesPanel: (show: boolean) => void

  season: Season
  setSeason: (season: Season) => void

  selectedGenetId: string | null
  setSelectedGenetId: (id: string | null) => void

  genetHighlightMode: boolean
  setGenetHighlightMode: (on: boolean) => void

  confidenceOverlay: boolean
  setConfidenceOverlay: (on: boolean) => void

  kinHighlightActive: boolean
  setKinHighlightActive: (on: boolean) => void

  defenceSignalTreeId: string | null
  defenceSignalTime: number // timestamp when signal was triggered
  triggerDefenceSignal: (treeId: string) => void
  clearDefenceSignal: () => void

  // Camera state for mode transitions
  lastNarrativeCameraPos: [number, number, number]
  setLastNarrativeCameraPos: (pos: [number, number, number]) => void
}

export const useAppStore = create<AppState>((set) => ({
  mode: 'narrative',
  setMode: (mode) => set({ mode }),

  scrollProgress: 0,
  setScrollProgress: (scrollProgress) => set({ scrollProgress }),

  selectedNodeId: null,
  setSelectedNodeId: (selectedNodeId) => set({ selectedNodeId }),

  hoveredNodeId: null,
  setHoveredNodeId: (hoveredNodeId) => set({ hoveredNodeId }),

  nutrientFilters: {
    carbon: true,
    water: true,
    phosphorus: true,
    nitrogen: true,
  },
  toggleNutrient: (type) =>
    set((state) => ({
      nutrientFilters: {
        ...state.nutrientFilters,
        [type]: !state.nutrientFilters[type],
      },
    })),

  particleSpeed: 1.0,
  setParticleSpeed: (particleSpeed) => set({ particleSpeed }),

  isMobile: false,
  setIsMobile: (isMobile) => set({ isMobile }),

  showSourcesPanel: false,
  setShowSourcesPanel: (showSourcesPanel) => set({ showSourcesPanel }),

  season: 'summer',
  setSeason: (season) => set({ season }),

  selectedGenetId: null,
  setSelectedGenetId: (selectedGenetId) => set({ selectedGenetId }),

  genetHighlightMode: false,
  setGenetHighlightMode: (genetHighlightMode) => set({ genetHighlightMode }),

  confidenceOverlay: false,
  setConfidenceOverlay: (confidenceOverlay) => set({ confidenceOverlay }),

  kinHighlightActive: false,
  setKinHighlightActive: (kinHighlightActive) => set({ kinHighlightActive }),

  defenceSignalTreeId: null,
  defenceSignalTime: 0,
  triggerDefenceSignal: (treeId) => set({ defenceSignalTreeId: treeId, defenceSignalTime: Date.now() }),
  clearDefenceSignal: () => set({ defenceSignalTreeId: null, defenceSignalTime: 0 }),

  lastNarrativeCameraPos: [0, 15, 30],
  setLastNarrativeCameraPos: (lastNarrativeCameraPos) =>
    set({ lastNarrativeCameraPos }),
}))
