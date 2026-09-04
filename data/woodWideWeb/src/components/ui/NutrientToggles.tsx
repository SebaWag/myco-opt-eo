import { useAppStore } from '../../stores/appStore'
import { COLORS, type NutrientType } from '../../utils/colors'

const NUTRIENTS: { type: NutrientType; label: string; color: string }[] = [
  { type: 'carbon', label: 'Carbon', color: COLORS.carbon },
  { type: 'phosphorus', label: 'Phosphorus', color: COLORS.phosphorus },
  { type: 'nitrogen', label: 'Nitrogen', color: COLORS.nitrogen },
  { type: 'water', label: 'Water', color: COLORS.water },
]

export function NutrientToggles() {
  const filters = useAppStore((s) => s.nutrientFilters)
  const toggle = useAppStore((s) => s.toggleNutrient)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <p style={{ fontSize: '0.75rem', color: '#A09880', marginBottom: '0.25rem' }}>
        Nutrient Flow
      </p>
      {NUTRIENTS.map(({ type, label, color }) => (
        <button
          key={type}
          onClick={() => toggle(type)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: filters[type] ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${filters[type] ? color + '66' : 'rgba(255,255,255,0.05)'}`,
            borderRadius: '6px',
            padding: '0.4rem 0.75rem',
            cursor: 'pointer',
            color: filters[type] ? color : '#666',
            fontSize: '0.85rem',
            fontFamily: "'Georgia', serif",
            transition: 'all 0.2s ease',
          }}
        >
          <div style={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: filters[type] ? color : '#444',
            transition: 'background 0.2s ease',
          }} />
          {label}
        </button>
      ))}
    </div>
  )
}
