import { CitationMarker } from './CitationMarker'

export function Section3_UndergroundEconomy() {
  return (
    <section style={sectionStyle}>
      <div style={contentStyle}>
        <h2 style={headingStyle}>A Living Economy</h2>

        <div style={flowDiagram}>
          <div style={flowItem}>
            <div style={{ ...nutrientDot, background: '#F5A623' }} />
            <div>
              <strong style={{ color: '#F5A623' }}>Carbon</strong>
              <p style={flowDesc}>
                Trees photosynthesise sugars and send them down to their fungal
                partners — up to ~280 kg C/ha/yr between tall trees and their
                neighbours.
                <CitationMarker sourceIds={['klein2016']} />{' '}
                This is the tree's payment to the fungus for mineral nutrients.
              </p>
            </div>
          </div>

          <div style={flowItem}>
            <div style={{ ...nutrientDot, background: '#9B59F0' }} />
            <div>
              <strong style={{ color: '#9B59F0' }}>Phosphorus</strong>
              <p style={flowDesc}>
                Fungi mine phosphorus from rock particles and organic matter,
                delivering it directly to tree roots — a nutrient trees cannot
                access efficiently alone.
                <CitationMarker sourceIds={['smith2009']} />
              </p>
            </div>
          </div>

          <div style={flowItem}>
            <div style={{ ...nutrientDot, background: '#4ADE80' }} />
            <div>
              <strong style={{ color: '#4ADE80' }}>Nitrogen</strong>
              <p style={flowDesc}>
                Fungal enzymes break down organic matter and deliver nitrogen
                to tree roots through the mycorrhizal interface.
                <CitationMarker sourceIds={['he2006']} />
              </p>
            </div>
          </div>

          <div style={flowItem}>
            <div style={{ ...nutrientDot, background: '#00D4FF' }} />
            <div>
              <strong style={{ color: '#00D4FF' }}>Water</strong>
              <p style={flowDesc}>
                Mycorrhizal fungi transport water to host plants, contributing
                up to 34.6% of host transpiration.
                <CitationMarker sourceIds={['kakouridis2022']} />{' '}
                Water redistributes through the network between trees.
              </p>
            </div>
          </div>
        </div>

        <p style={noteStyle}>
          The first evidence of bidirectional carbon transfer between trees came
          from Simard et al. (1997)
          <CitationMarker sourceIds={['simard1997']} /> — shaded understorey fir
          received net carbon from sunlit neighbours in summer; the flow direction
          reversed seasonally.
        </p>

        <div style={carbonSinkBox}>
          <h3 style={carbonSinkHeading}>A Planetary Carbon Pump</h3>
          <p style={carbonSinkText}>
            Scale this plot to the entire planet and the numbers become
            staggering. Each year, plants channel the equivalent of{' '}
            <strong style={{ color: '#F5A623' }}>13.12 billion tonnes of CO₂</strong>{' '}
            underground through mycorrhizal fungi — roughly{' '}
            <strong style={{ color: '#F5A623' }}>36% of annual fossil fuel emissions</strong>.
            <CitationMarker sourceIds={['hawkins2023']} />
          </p>
          <p style={carbonSinkText}>
            Not all of this is permanently stored — fungi respire some back to the
            atmosphere. But in boreal forests, 50–70% of long-term soil carbon comes
            from roots and their fungal partners, not from fallen leaves.
            <CitationMarker sourceIds={['clemmensen2013']} />{' '}
            Globally, fungi hold ~12 Gt C in biomass alone
            <CitationMarker sourceIds={['baron2018']} /> — and ~85% of all plant
            species depend on mycorrhizal associations.
            <CitationMarker sourceIds={['soudzilovskaia2019']} />
          </p>
          <p style={{ ...carbonSinkText, marginBottom: 0, fontStyle: 'italic', color: '#A09880' }}>
            These networks are not just trading floors. They are one of Earth's
            largest mechanisms for moving carbon out of the atmosphere and into
            the ground.
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
  marginBottom: '2rem',
  textAlign: 'center',
}

const flowDiagram: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: '1.5rem',
}

const flowItem: React.CSSProperties = {
  display: 'flex',
  alignItems: 'flex-start',
  gap: '1rem',
  background: 'rgba(255,255,255,0.02)',
  padding: '1.2rem',
  borderRadius: '10px',
  border: '1px solid rgba(255,255,255,0.05)',
}

const nutrientDot: React.CSSProperties = {
  width: '12px',
  height: '12px',
  borderRadius: '50%',
  marginTop: '4px',
  flexShrink: 0,
}

const flowDesc: React.CSSProperties = {
  color: '#A09880',
  fontSize: '0.95rem',
  marginTop: '0.3rem',
  lineHeight: 1.6,
}

const noteStyle: React.CSSProperties = {
  color: '#A09880',
  marginTop: '2rem',
  fontSize: '1.05rem',
  lineHeight: 1.7,
  textAlign: 'center',
}

const carbonSinkBox: React.CSSProperties = {
  marginTop: '2.5rem',
  background: 'rgba(245, 166, 35, 0.04)',
  border: '1px solid rgba(245, 166, 35, 0.15)',
  borderRadius: '12px',
  padding: '1.8rem',
}

const carbonSinkHeading: React.CSSProperties = {
  fontSize: '1.3rem',
  fontWeight: 400,
  color: '#F5F0E8',
  marginBottom: '1rem',
  textAlign: 'center',
}

const carbonSinkText: React.CSSProperties = {
  fontSize: '1rem',
  lineHeight: 1.7,
  color: '#C8C0B0',
  marginBottom: '0.8rem',
}
