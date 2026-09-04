import { useAppStore } from '../../stores/appStore'
import { SOURCES, CATEGORY_LABELS, getDoiUrl, type SourceCategory } from '../../data/sources'

const CATEGORY_ORDER: SourceCategory[] = [
  'network-structure',
  'nutrient-transfer',
  'mother-trees',
  'defence-signalling',
  'ecological-context',
  'scientific-debate',
]

export function SourcesPanel() {
  const showSourcesPanel = useAppStore((s) => s.showSourcesPanel)
  const setShowSourcesPanel = useAppStore((s) => s.setShowSourcesPanel)

  if (!showSourcesPanel) return null

  return (
    <div style={overlayStyle} onClick={() => setShowSourcesPanel(false)}>
      <div style={panelStyle} onClick={(e) => e.stopPropagation()}>
        <button
          onClick={() => setShowSourcesPanel(false)}
          style={closeButton}
          aria-label="Close sources panel"
        >
          &times;
        </button>

        <h2 style={titleStyle}>Sources & References</h2>

        <p style={introStyle}>
          This visualisation is grounded in peer-reviewed mycorrhizal ecology research.
          Network topology is based on molecular identification of shared fungal genets
          (Beiler et al. 2010). Nutrient flow directions are informed by isotope tracing
          studies. Every quantitative claim in the narrative links to its source.
        </p>

        {/* Scientific debate callout */}
        <div style={debateBox}>
          <h3 style={debateTitle}>A living scientific debate</h3>
          <p style={debateText}>
            The "Wood Wide Web" metaphor has sparked genuine scientific controversy.
            Critics (Karst et al. 2023, Henriksson et al. 2023) argue that measured
            carbon transfers between trees may be too small to affect fitness, and that
            the "forest intelligence" framing overstates the evidence. Defenders
            (Simard et al. 2025) respond with updated data on network facilitation.
          </p>
          <p style={{ ...debateText, marginBottom: 0 }}>
            This visualisation shows where evidence is strong and where it remains
            contested. The confidence overlay (coming in a future update) will colour
            every connection by its evidence strength.
          </p>
        </div>

        {/* Sources grouped by category */}
        {CATEGORY_ORDER.map(category => {
          const categorySources = SOURCES.filter(s => s.category === category)
          if (categorySources.length === 0) return null

          return (
            <div key={category} style={categorySection}>
              <h3 style={categoryTitle}>{CATEGORY_LABELS[category]}</h3>
              {categorySources.map(source => (
                <div key={source.id} style={sourceCard}>
                  <p style={sourceAuthors}>
                    {source.authors} ({source.year})
                  </p>
                  <p style={sourceTitle}>
                    <a
                      href={getDoiUrl(source.doi)}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={doiLink}
                    >
                      {source.title}
                    </a>
                  </p>
                  <p style={sourceJournal}>{source.journal}</p>
                  <p style={sourceSummary}>{source.summary}</p>
                </div>
              ))}
            </div>
          )
        })}

        <p style={footerStyle}>
          DOI links open in a new tab. If a link is behind a paywall, search the
          title on Google Scholar for open-access versions.
        </p>
      </div>
    </div>
  )
}

const overlayStyle: React.CSSProperties = {
  position: 'fixed',
  inset: 0,
  zIndex: 100,
  background: 'rgba(10, 8, 6, 0.92)',
  backdropFilter: 'blur(8px)',
  display: 'flex',
  justifyContent: 'center',
  overflowY: 'auto',
}

const panelStyle: React.CSSProperties = {
  maxWidth: '720px',
  width: '100%',
  padding: '3rem 2rem',
  position: 'relative',
  color: '#F5F0E8',
  fontFamily: "'Georgia', serif",
}

const closeButton: React.CSSProperties = {
  position: 'fixed',
  top: '1.5rem',
  right: '1.5rem',
  background: 'rgba(255, 255, 255, 0.06)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '50%',
  width: '40px',
  height: '40px',
  color: '#A09880',
  fontSize: '1.5rem',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s ease',
  zIndex: 101,
}

const titleStyle: React.CSSProperties = {
  fontSize: '2rem',
  fontWeight: 300,
  marginBottom: '1.5rem',
  letterSpacing: '-0.01em',
}

const introStyle: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.7,
  color: '#A09880',
  marginBottom: '2rem',
}

const debateBox: React.CSSProperties = {
  background: 'rgba(255, 184, 0, 0.04)',
  border: '1px solid rgba(255, 184, 0, 0.15)',
  borderRadius: '10px',
  padding: '1.5rem',
  marginBottom: '2.5rem',
}

const debateTitle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#FFB800',
  marginBottom: '0.75rem',
}

const debateText: React.CSSProperties = {
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: '#C8C0B0',
  marginBottom: '0.75rem',
}

const categorySection: React.CSSProperties = {
  marginBottom: '2rem',
}

const categoryTitle: React.CSSProperties = {
  fontSize: '1.1rem',
  fontWeight: 600,
  color: '#F5F0E8',
  marginBottom: '1rem',
  paddingBottom: '0.5rem',
  borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
}

const sourceCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.04)',
  borderRadius: '8px',
  padding: '1rem',
  marginBottom: '0.75rem',
}

const sourceAuthors: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#A09880',
  marginBottom: '0.25rem',
}

const sourceTitle: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  marginBottom: '0.25rem',
}

const doiLink: React.CSSProperties = {
  color: '#FFB800',
  textDecoration: 'none',
  transition: 'color 0.2s ease',
}

const sourceJournal: React.CSSProperties = {
  fontSize: '0.85rem',
  fontStyle: 'italic',
  color: '#A09880',
  marginBottom: '0.5rem',
}

const sourceSummary: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: '#C8C0B0',
}

const footerStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#666',
  marginTop: '2rem',
  textAlign: 'center',
  fontStyle: 'italic',
}
