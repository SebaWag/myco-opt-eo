import { CitationMarker } from './CitationMarker'

export function Section5_KinAndStrangers() {
  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>Kin and Strangers</h2>

        <p style={paragraphStyle}>
          The most extraordinary claim about mycorrhizal networks: mother trees
          may send <strong style={{ color: '#FFB800' }}>up to 4× more carbon
          </strong> to their own kin than to unrelated seedlings.
          <CitationMarker sourceIds={['pickles2017']} />{' '}
          Douglas fir seedlings show increased mycorrhizal colonisation when
          grown in soil from their mother tree.
          <CitationMarker sourceIds={['asay2020']} />
        </p>

        <div style={featureCard}>
          <h3 style={featureTitle}>Defence Signalling</h3>
          <p style={featureDesc}>
            When aphids attack a tree, warning signals cascade through the
            mycorrhizal network. Connected neighbours upregulate their defences
            <em> before</em> the attack reaches them — communication through
            the fungal web, not the air.
            <CitationMarker sourceIds={['babikova2013', 'song2010']} />
          </p>
          <p style={featureHint}>
            In interactive mode, Shift+click any tree to trigger a defence
            signal cascade.
          </p>
        </div>

        <div style={featureCard}>
          <h3 style={featureTitle}>Dying gifts</h3>
          <p style={featureDesc}>
            Research suggests dying mother trees transfer carbon reserves to
            the network — though the extent of this and its ecological
            significance are actively debated.
            <CitationMarker sourceIds={['simard2012', 'henriksson2023']} />
          </p>
        </div>
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
  maxWidth: '620px',
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

const featureCard: React.CSSProperties = {
  background: 'rgba(255, 255, 255, 0.02)',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  borderRadius: '10px',
  padding: '1.5rem',
  marginBottom: '1rem',
  textAlign: 'left',
}

const featureTitle: React.CSSProperties = {
  fontSize: '1rem',
  fontWeight: 600,
  color: '#FFB800',
  marginBottom: '0.5rem',
}

const featureDesc: React.CSSProperties = {
  fontSize: '0.95rem',
  lineHeight: 1.7,
  color: '#C8C0B0',
}

const featureHint: React.CSSProperties = {
  fontSize: '0.8rem',
  color: '#666',
  marginTop: '0.5rem',
  fontStyle: 'italic',
}
