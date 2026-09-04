import { useAppStore } from '../../stores/appStore'
import { NutrientToggles } from './NutrientToggles'
import { SpeedSlider } from './SpeedSlider'
import { SeasonDial } from './SeasonDial'

export function InteractiveHUD() {
  const mode = useAppStore((s) => s.mode)
  const setMode = useAppStore((s) => s.setMode)
  const isMobile = useAppStore((s) => s.isMobile)
  const setShowSourcesPanel = useAppStore((s) => s.setShowSourcesPanel)
  const genetHighlightMode = useAppStore((s) => s.genetHighlightMode)
  const setGenetHighlightMode = useAppStore((s) => s.setGenetHighlightMode)
  const setSelectedGenetId = useAppStore((s) => s.setSelectedGenetId)
  const confidenceOverlay = useAppStore((s) => s.confidenceOverlay)
  const setConfidenceOverlay = useAppStore((s) => s.setConfidenceOverlay)
  const kinHighlightActive = useAppStore((s) => s.kinHighlightActive)
  const setKinHighlightActive = useAppStore((s) => s.setKinHighlightActive)

  if (mode !== 'interactive') return null

  return (
    <div style={hudStyle}>
      <div style={panelStyle}>
        <h3 style={{
          fontSize: '0.9rem',
          fontWeight: 600,
          marginBottom: '1rem',
          color: '#F5F0E8',
        }}>
          Controls
        </h3>

        <SeasonDial />

        <div style={divider} />

        <NutrientToggles />

        <div style={{ marginTop: '1rem' }}>
          <SpeedSlider />
        </div>

        <div style={divider} />

        {/* Kin recognition toggle */}
        <button
          onClick={() => setKinHighlightActive(!kinHighlightActive)}
          style={{
            ...toggleButton,
            borderColor: kinHighlightActive ? '#E879A8' : 'rgba(255,255,255,0.1)',
            color: kinHighlightActive ? '#E879A8' : '#A09880',
            background: kinHighlightActive ? 'rgba(232, 121, 168, 0.08)' : 'rgba(255,255,255,0.02)',
          }}
        >
          {kinHighlightActive ? 'Kin Recognition: ON' : 'Kin Recognition'}
        </button>

        {kinHighlightActive && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', lineHeight: 1.5, color: '#A09880' }}>
            <p style={{ margin: 0 }}>Mother trees send up to 4&times; more carbon to kin</p>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.65rem', fontStyle: 'italic' }}>Click a mother tree to fly there</p>
          </div>
        )}

        <div style={{ height: '0.5rem' }} />

        {/* Genet highlight toggle */}
        <button
          onClick={() => {
            const next = !genetHighlightMode
            setGenetHighlightMode(next)
            if (!next) setSelectedGenetId(null)
          }}
          style={{
            ...toggleButton,
            borderColor: genetHighlightMode ? '#FFB800' : 'rgba(255,255,255,0.1)',
            color: genetHighlightMode ? '#FFB800' : '#A09880',
            background: genetHighlightMode ? 'rgba(255, 184, 0, 0.08)' : 'rgba(255,255,255,0.02)',
          }}
        >
          {genetHighlightMode ? 'Genet Mode: ON' : 'Genet Highlight'}
        </button>

        {/* Confidence overlay toggle */}
        <button
          onClick={() => setConfidenceOverlay(!confidenceOverlay)}
          style={{
            ...toggleButton,
            marginTop: '0.5rem',
            borderColor: confidenceOverlay ? '#22C55E' : 'rgba(255,255,255,0.1)',
            color: confidenceOverlay ? '#22C55E' : '#A09880',
            background: confidenceOverlay ? 'rgba(34, 197, 94, 0.08)' : 'rgba(255,255,255,0.02)',
          }}
        >
          {confidenceOverlay ? 'Confidence: ON' : 'Confidence Overlay'}
        </button>

        {/* Confidence legend */}
        {confidenceOverlay && (
          <div style={{ marginTop: '0.4rem', fontSize: '0.7rem', lineHeight: 1.5 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} />
              <span style={{ color: '#22C55E' }}>Established</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }} />
              <span style={{ color: '#F59E0B' }}>Demonstrated</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
              <span style={{ color: '#EF4444' }}>Contested</span>
            </div>
          </div>
        )}

        <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#A09880' }}>
          {isMobile ? (
            <>
              <p>Two-finger drag to orbit</p>
              <p>Pinch to zoom</p>
              <p>Tap a node to explore</p>
            </>
          ) : (
            <>
              <p>Drag to orbit &middot; Scroll to zoom</p>
              <p>Hover node for info &middot; Click to fly</p>
              <p>Shift+click tree for defence signal</p>
            </>
          )}
        </div>

        <button
          onClick={() => setShowSourcesPanel(true)}
          style={sourcesButton}
        >
          Sources
        </button>

        <button
          onClick={() => {
            setMode('narrative')
            window.scrollTo({ top: 0, behavior: 'smooth' })
          }}
          style={backButton}
        >
          Back to Story
        </button>
      </div>
    </div>
  )
}

const hudStyle: React.CSSProperties = {
  position: 'fixed',
  left: '1.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  zIndex: 10,
  maxHeight: '90vh',
  overflowY: 'auto',
}

const panelStyle: React.CSSProperties = {
  background: 'rgba(20, 18, 14, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.25rem',
  width: 'min(200px, calc(100vw - 3rem))',
  color: '#F5F0E8',
  fontFamily: "'Georgia', serif",
}

const divider: React.CSSProperties = {
  height: '1px',
  background: 'rgba(255, 255, 255, 0.06)',
  margin: '1rem 0',
}

const toggleButton: React.CSSProperties = {
  width: '100%',
  padding: '0.5rem',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  transition: 'all 0.2s ease',
  background: 'rgba(255, 255, 255, 0.02)',
  color: '#A09880',
}

const sourcesButton: React.CSSProperties = {
  marginTop: '1rem',
  width: '100%',
  padding: '0.5rem',
  background: 'rgba(255, 184, 0, 0.04)',
  border: '1px solid rgba(255, 184, 0, 0.3)',
  borderRadius: '6px',
  color: '#A09880',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  transition: 'all 0.2s ease',
}

const backButton: React.CSSProperties = {
  marginTop: '0.5rem',
  width: '100%',
  padding: '0.5rem',
  background: 'rgba(255, 255, 255, 0.04)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '6px',
  color: '#A09880',
  fontSize: '0.8rem',
  cursor: 'pointer',
  fontFamily: "'Georgia', serif",
  transition: 'all 0.2s ease',
}
