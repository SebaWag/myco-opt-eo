import { useAppStore, type Season } from '../../stores/appStore'

const SEASONS: { id: Season; label: string; color: string; angle: number }[] = [
  { id: 'spring', label: 'Spring', color: '#4ADE80', angle: 0 },
  { id: 'summer', label: 'Summer', color: '#F5A623', angle: 90 },
  { id: 'autumn', label: 'Autumn', color: '#E67E22', angle: 180 },
  { id: 'winter', label: 'Winter', color: '#87CEEB', angle: 270 },
]

export function SeasonDial() {
  const season = useAppStore((s) => s.season)
  const setSeason = useAppStore((s) => s.setSeason)

  const currentAngle = SEASONS.find(s => s.id === season)?.angle ?? 0

  return (
    <div>
      <p style={{
        fontSize: '0.75rem',
        color: '#A09880',
        marginBottom: '0.5rem',
      }}>
        Season
      </p>

      {/* Circular dial */}
      <div style={dialContainer}>
        <svg viewBox="0 0 100 100" style={{ width: '100%', height: '100%' }}>
          {/* Background circle */}
          <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2" />

          {/* Season segments */}
          {SEASONS.map((s) => {
            const isActive = season === s.id
            const rad = (s.angle - 90) * Math.PI / 180
            const x = 50 + 40 * Math.cos(rad)
            const y = 50 + 40 * Math.sin(rad)

            return (
              <g key={s.id} onClick={() => setSeason(s.id)} style={{ cursor: 'pointer' }}>
                {/* Invisible larger touch target */}
                <circle cx={x} cy={y} r={18} fill="transparent" />
                {/* Visible indicator */}
                <circle
                  cx={x}
                  cy={y}
                  r={isActive ? 12 : 9}
                  fill={isActive ? s.color : 'rgba(255,255,255,0.04)'}
                  stroke={s.color}
                  strokeWidth={isActive ? 2 : 1}
                  opacity={isActive ? 1 : 0.5}
                  style={{ transition: 'all 0.3s ease' }}
                />
                {/* Label */}
                <text
                  x={x}
                  y={y}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fill={isActive ? '#0A0806' : s.color}
                  fontSize={isActive ? '9' : '7'}
                  fontWeight={isActive ? 'bold' : 'normal'}
                  style={{ pointerEvents: 'none', fontFamily: "'Georgia', serif" }}
                >
                  {s.label.charAt(0)}
                </text>
              </g>
            )
          })}

          {/* Indicator needle */}
          <line
            x1="50"
            y1="50"
            x2={50 + 28 * Math.cos((currentAngle - 90) * Math.PI / 180)}
            y2={50 + 28 * Math.sin((currentAngle - 90) * Math.PI / 180)}
            stroke={SEASONS.find(s => s.id === season)?.color ?? '#fff'}
            strokeWidth="2"
            strokeLinecap="round"
            opacity="0.6"
            style={{ transition: 'all 0.4s ease' }}
          />

          {/* Center dot */}
          <circle cx="50" cy="50" r="3" fill="rgba(255,255,255,0.15)" />
        </svg>
      </div>

      {/* Season label */}
      <p style={{
        textAlign: 'center',
        fontSize: '0.8rem',
        color: SEASONS.find(s => s.id === season)?.color,
        fontWeight: 600,
        marginTop: '0.25rem',
        transition: 'color 0.3s ease',
      }}>
        {SEASONS.find(s => s.id === season)?.label}
      </p>

      {/* Season description */}
      <p style={{
        fontSize: '0.7rem',
        color: '#666',
        marginTop: '0.25rem',
        lineHeight: 1.4,
        textAlign: 'center',
      }}>
        {season === 'summer' && 'Peak flow — carbon moves to shaded trees'}
        {season === 'autumn' && 'Flow reverses — carbon returns to larger trees'}
        {season === 'spring' && 'Network reactivating — moderate flow'}
        {season === 'winter' && 'Minimal activity — network dormant'}
      </p>
    </div>
  )
}

const dialContainer: React.CSSProperties = {
  width: '100%',
  maxWidth: '120px',
  aspectRatio: '1',
  margin: '0 auto',
}
