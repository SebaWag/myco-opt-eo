import { AnimatedCounter } from './AnimatedCounter'
import { CitationMarker } from './CitationMarker'

export function Section4_MotherTrees() {
  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>The Hub Trees</h2>

        <p style={paragraphStyle}>
          The network's connection distribution follows a power law — most trees
          have few connections, but a handful are massively connected hubs.
          <CitationMarker sourceIds={['beiler2010']} />{' '}
          This scale-free topology mirrors the structure of the internet:
          a few routers carry most of the traffic.
        </p>

        <div style={highlight}>
          <AnimatedCounter end={47} />
          <p style={statLabel}>
            trees connected to the most-connected hub in this 30×30m plot
            <CitationMarker sourceIds={['beiler2010']} />
          </p>
        </div>

        <p style={paragraphStyle}>
          These veteran trees — the oldest and largest — are not just
          well-connected. They sit at critical <em>bridges</em> between
          clusters, giving them disproportionate influence over resource
          distribution through the network.
        </p>

        <p style={{ ...paragraphStyle, color: '#A09880', fontSize: '1rem' }}>
          Multiple age cohorts — veterans, mature trees, and saplings — are
          connected through the same fungal genets, linking generations
          underground.
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
  maxWidth: '600px',
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
  fontSize: '1.15rem',
  lineHeight: 1.7,
  color: '#F5F0E8',
  marginBottom: '1.5rem',
}

const highlight: React.CSSProperties = {
  background: 'rgba(255, 184, 0, 0.06)',
  border: '1px solid rgba(255, 184, 0, 0.15)',
  borderRadius: '12px',
  padding: '2rem',
  margin: '2rem 0',
}

const statLabel: React.CSSProperties = {
  color: '#A09880',
  fontSize: '1rem',
  marginTop: '0.5rem',
}
