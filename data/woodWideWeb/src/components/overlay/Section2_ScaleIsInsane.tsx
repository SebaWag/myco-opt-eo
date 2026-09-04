import { AnimatedCounter } from './AnimatedCounter'
import { CitationMarker } from './CitationMarker'

export function Section2_ScaleIsInsane() {
  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>The Network Revealed</h2>

        <p style={{ ...paragraphStyle, marginBottom: '2rem' }}>
          As the camera descends through the soil, the hidden architecture appears.
          In this 30×30 metre plot of Douglas fir forest, molecular identification
          revealed 27 distinct fungal genets connecting 67 trees.
          <CitationMarker sourceIds={['beiler2010']} />
        </p>

        <div style={statGrid}>
          <div style={statCard}>
            <AnimatedCounter end={92} suffix="%" />
            <p style={statLabel}>
              of plant families form mycorrhizal associations
              <CitationMarker sourceIds={['smith2009', 'brundrett2009']} />
            </p>
          </div>

          <div style={statCard}>
            <AnimatedCounter end={400} suffix="M+" />
            <p style={statLabel}>
              years old — mycorrhizal symbioses predate roots
              <CitationMarker sourceIds={['smith2009']} />
            </p>
          </div>

          <div style={statCard}>
            <AnimatedCounter end={47} />
            <p style={statLabel}>
              trees connected to the most-connected hub tree in a single plot
              <CitationMarker sourceIds={['beiler2010']} />
            </p>
          </div>

          <div style={statCard}>
            <AnimatedCounter end={27} />
            <p style={statLabel}>
              distinct fungal genets — each a single living organism spanning multiple trees
              <CitationMarker sourceIds={['beiler2010']} />
            </p>
          </div>
        </div>

        <p style={{ ...paragraphStyle, marginTop: '2rem' }}>
          Each genet is a genetically unique fungal individual. Some span the
          entire plot, connecting dozens of trees through a single organism.
          <CitationMarker sourceIds={['beiler2010', 'beiler2012']} />
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
  maxWidth: '700px',
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
  marginBottom: '2rem',
  letterSpacing: '-0.01em',
}

const statGrid: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '2rem',
}

const statCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.03)',
  borderRadius: '12px',
  padding: '1.5rem',
  border: '1px solid rgba(255,255,255,0.06)',
}

const statLabel: React.CSSProperties = {
  fontSize: '0.95rem',
  color: '#A09880',
  marginTop: '0.5rem',
  lineHeight: 1.5,
}

const paragraphStyle: React.CSSProperties = {
  fontSize: '1.15rem',
  lineHeight: 1.7,
  color: '#A09880',
}
