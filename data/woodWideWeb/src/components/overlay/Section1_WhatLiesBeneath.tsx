import { CitationMarker } from './CitationMarker'

export function Section1_WhatLiesBeneath() {
  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h1 style={{
          fontSize: 'clamp(1.8rem, 6vw, 3.5rem)',
          fontWeight: 300,
          letterSpacing: '-0.02em',
          marginBottom: '1.5rem',
          lineHeight: 1.1,
        }}>
          What You See
        </h1>
        <p style={paragraphStyle}>
          A forest looks like a collection of individual trees, each standing alone.
          But beneath every forest is a hidden network of fungal threads connecting
          tree to tree in a web of mutual exchange that has existed for over 400
          million years.<CitationMarker sourceIds={['smith2009']} />
        </p>
        <p style={{ ...paragraphStyle, color: '#A09880' }}>
          Scientists call it the <em>mycorrhizal network</em> — from the Greek{' '}
          <em>mykes</em> (fungus) and <em>rhiza</em> (root).<br />
          The popular term is the <strong>Wood Wide Web</strong>.
        </p>
      </div>
    </section>
  )
}

const sectionStyle: React.CSSProperties = {
  height: '100vh',
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

const paragraphStyle: React.CSSProperties = {
  fontSize: 'clamp(1rem, 2.5vw, 1.25rem)',
  lineHeight: 1.7,
  color: '#F5F0E8',
  marginBottom: '1rem',
}
