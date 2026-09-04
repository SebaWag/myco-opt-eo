import { useAppStore } from '../../stores/appStore'
import { CitationMarker } from './CitationMarker'

export function Section7_Explore() {
  const setMode = useAppStore((s) => s.setMode)
  const setShowSourcesPanel = useAppStore((s) => s.setShowSourcesPanel)

  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>
          Explore the Network
        </h2>
        <p style={paragraphStyle}>
          This visualisation maps a real mycorrhizal network studied by
          Beiler et al.
          <CitationMarker sourceIds={['beiler2010', 'beiler2015']} /> — 67
          Douglas fir trees connected by 27 fungal genets through 220 connections
          in a 30×30 metre forest plot.
        </p>
        <p style={paragraphStyle}>
          In interactive mode you can:
        </p>
        <ul style={featureList}>
          <li>Rotate the season dial to shift nutrient flow direction</li>
          <li>Toggle the confidence overlay to see evidence strength</li>
          <li>Highlight individual genets as single organisms</li>
          <li>Shift+click a tree to trigger a defence signal cascade</li>
          <li>Click any tree for connection details</li>
        </ul>
        <button
          onClick={() => setMode('interactive')}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'rgba(255, 184, 0, 0.2)'
            e.currentTarget.style.borderColor = '#FFB800'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 184, 0, 0.08)'
            e.currentTarget.style.borderColor = 'rgba(255, 184, 0, 0.3)'
          }}
        >
          Enter Interactive Mode
        </button>
        <p style={footerStyle}>
          <span
            onClick={() => setShowSourcesPanel(true)}
            style={sourcesLink}
          >
            View all sources
          </span>
          {' '}&middot;{' '}
          Data: Beiler et al. (2010/2015)
          {' '}&middot;{' '}
          Built with Three.js + React
        </p>
      </div>
    </section>
  )
}

const sectionStyle: React.CSSProperties = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '2rem',
}

const contentStyle: React.CSSProperties = {
  maxWidth: '550px',
  textAlign: 'center',
  background: 'rgba(10, 8, 6, 0.45)',
  backdropFilter: 'blur(8px)',
  borderRadius: '16px',
  padding: '2.5rem',
  border: '1px solid rgba(255, 255, 255, 0.04)',
}

const headingStyle: React.CSSProperties = {
  fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
  fontWeight: 300,
  marginBottom: '1.5rem',
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  lineHeight: 1.7,
  color: '#A09880',
  marginBottom: '1rem',
}

const featureList: React.CSSProperties = {
  textAlign: 'left',
  color: '#A09880',
  fontSize: '0.95rem',
  lineHeight: 2,
  marginBottom: '1.5rem',
  paddingLeft: '1.5rem',
  listStyleType: 'none',
}

const buttonStyle: React.CSSProperties = {
  marginTop: '1rem',
  padding: '1rem 2.5rem',
  fontSize: '1.1rem',
  fontFamily: "'Georgia', serif",
  color: '#FFB800',
  background: 'rgba(255, 184, 0, 0.08)',
  border: '1px solid rgba(255, 184, 0, 0.3)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
}

const footerStyle: React.CSSProperties = {
  color: '#A09880',
  fontSize: '0.85rem',
  marginTop: '1.5rem',
}

const sourcesLink: React.CSSProperties = {
  color: '#FFB800',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
}
