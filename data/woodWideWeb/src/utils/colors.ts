import * as THREE from 'three'

export const COLORS = {
  background: '#0A0806',
  soil: '#1A1510',
  soilLine: '#3D3020',
  text: '#F5F0E8',
  textMuted: '#A09880',

  // Nutrient colors
  carbon: '#F5A623',    // warm amber
  water: '#00D4FF',     // cyan
  phosphorus: '#9B59F0', // violet
  nitrogen: '#4ADE80',   // green

  // Tree colors
  trunk: '#8B6914',
  canopy: '#2D5016',
  canopyLight: '#4A7A28',

  // Network
  fungalDefault: '#C4A35A',
  fungalGlow: '#FFD700',
  motherTree: '#FFB800',
  nodeDefault: '#A08850',
  nodeHover: '#FFD700',
} as const

export const NUTRIENT_COLORS_THREE = {
  carbon: new THREE.Color(COLORS.carbon),
  water: new THREE.Color(COLORS.water),
  phosphorus: new THREE.Color(COLORS.phosphorus),
  nitrogen: new THREE.Color(COLORS.nitrogen),
} as const

export type NutrientType = keyof typeof NUTRIENT_COLORS_THREE
