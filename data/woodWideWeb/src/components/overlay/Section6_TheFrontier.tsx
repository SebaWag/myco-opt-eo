import { CitationMarker } from './CitationMarker'
import { useAppStore } from '../../stores/appStore'

export function Section6_TheFrontier() {
  const setShowSourcesPanel = useAppStore((s) => s.setShowSourcesPanel)

  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>The Frontier</h2>

        <p style={paragraphStyle}>
          Not everything you've just read is settled science. The "Wood Wide Web"
          is a living research frontier, with genuine disagreements between
          scientists about what the evidence supports.
        </p>

        <div style={evidenceGrid}>
          <div style={evidenceCard}>
            <div style={{ ...evidenceDot, background: '#22C55E' }} />
            <h3 style={evidenceLabel}>Strong evidence</h3>
            <p style={evidenceDesc}>
              Physical connections between trees via shared fungal genets —
              confirmed through molecular identification.
              <CitationMarker sourceIds={['beiler2010']} />
            </p>
          </div>

          <div style={evidenceCard}>
            <div style={{ ...evidenceDot, background: '#F59E0B' }} />
            <h3 style={evidenceLabel}>Demonstrated but debated</h3>
            <p style={evidenceDesc}>
              Nutrient transfer via isotope tracing. Carbon, nitrogen, and
              phosphorus move between trees — but the <em>magnitude</em> and
              ecological significance are contested.
              <CitationMarker sourceIds={['simard1997', 'klein2016']} />
            </p>
          </div>

          <div style={evidenceCard}>
            <div style={{ ...evidenceDot, background: '#EF4444' }} />
            <h3 style={evidenceLabel}>Actively contested</h3>
            <p style={evidenceDesc}>
              Kin preference magnitude, deathbed carbon transfer, and
              "forest intelligence" framing. Critics argue measured
              transfers may be ecologically trivial.
              <CitationMarker sourceIds={['karst2023', 'henriksson2023']} />
            </p>
          </div>
        </div>

        <div style={debateBox}>
          <p style={debateText}>
            <strong>Karst et al. (2023)</strong> and <strong>Henriksson et al.
            (2023)</strong> challenge the mother tree narrative directly.{' '}
            <strong>Simard et al. (2025)</strong> respond with updated evidence
            for network-mediated communication.
            <CitationMarker sourceIds={['karst2023', 'henriksson2023', 'simard2025']} />
          </p>
          <p style={debateText}>
            Even the carbon sink numbers have nuance. The 13.12 Gt CO₂e/yr
            flowing underground
            <CitationMarker sourceIds={['hawkins2023']} />{' '}
            represents carbon <em>allocated</em> to fungi — not all of it stays
            there. How much persists as long-term soil carbon vs. is respired
            back is still a major open question.
          </p>
          <p style={{ ...debateText, marginBottom: 0 }}>
            This is how science works. Showing both sides — not picking
            one — is what separates this visualisation from every other
            "Wood Wide Web" explainer.
          </p>
        </div>

        <p style={{ ...paragraphStyle, color: '#A09880', fontSize: '1rem' }}>
          Toggle the{' '}
          <strong style={{ color: '#22C55E' }}>confidence overlay</strong>{' '}
          in interactive mode to see every connection coloured by its evidence
          strength.{' '}
          <span
            onClick={() => setShowSourcesPanel(true)}
            style={sourcesLink}
          >
            Read the full source list.
          </span>
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
  maxWidth: '650px',
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
  textAlign: 'center',
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '1.1rem',
  lineHeight: 1.7,
  color: '#F5F0E8',
  marginBottom: '1.5rem',
  textAlign: 'center',
}

const evidenceGrid: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1rem',
  marginBottom: '2rem',
}

const evidenceCard: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.05)',
  borderRadius: '10px',
  padding: '1.2rem',
}

const evidenceDot: React.CSSProperties = {
  width: '14px',
  height: '14px',
  borderRadius: '50%',
  marginTop: '3px',
  flexShrink: 0,
}

const evidenceLabel: React.CSSProperties = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: '#F5F0E8',
  marginBottom: '0.3rem',
}

const evidenceDesc: React.CSSProperties = {
  fontSize: '0.9rem',
  lineHeight: 1.6,
  color: '#A09880',
}

const debateBox: React.CSSProperties = {
  background: 'rgba(255, 184, 0, 0.04)',
  border: '1px solid rgba(255, 184, 0, 0.12)',
  borderRadius: '10px',
  padding: '1.5rem',
  marginBottom: '2rem',
}

const debateText: React.CSSProperties = {
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: '#C8C0B0',
  marginBottom: '0.75rem',
}

const sourcesLink: React.CSSProperties = {
  color: '#FFB800',
  cursor: 'pointer',
  textDecoration: 'underline',
  textUnderlineOffset: '2px',
}
