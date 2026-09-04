import { useMemo } from 'react'
import { useAppStore } from '../../stores/appStore'
import type { ComputedNetwork } from '../../types/network'
import { COLORS } from '../../utils/colors'

interface Props {
  network: ComputedNetwork
}

export function NodeInfoPanel({ network }: Props) {
  const hoveredNodeId = useAppStore((s) => s.hoveredNodeId)

  const info = useMemo(() => {
    if (!hoveredNodeId) return null
    const tree = network.data.trees.find((t) => t.id === hoveredNodeId)
    if (!tree) return null

    const connectedEdges = network.data.edges.filter(
      (e) => e.source === hoveredNodeId || e.target === hoveredNodeId
    )

    const connectedTreeIds = new Set(
      connectedEdges.map((e) =>
        e.source === hoveredNodeId ? e.target : e.source
      )
    )

    const nutrientBreakdown = connectedEdges.reduce(
      (acc, e) => {
        acc[e.nutrientType] = (acc[e.nutrientType] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )

    return { tree, connectedTreeIds, connectedEdges, nutrientBreakdown }
  }, [hoveredNodeId, network])

  if (!info) return null

  return (
    <div style={panelStyle}>

      <h3 style={{ margin: '0 0 0.5rem', fontSize: '1.2rem' }}>
        {info.tree.isMotherTree ? 'Mother Tree' : 'Tree'} {info.tree.id.replace('tree-', '#')}
      </h3>

      <p style={speciesStyle}>{info.tree.species}</p>

      <div style={statRow}>
        <span style={statLabel}>Diameter</span>
        <span style={statValue}>{info.tree.dbh} cm</span>
      </div>
      <div style={statRow}>
        <span style={statLabel}>Connections</span>
        <span style={statValue}>{info.connectedEdges.length}</span>
      </div>
      <div style={statRow}>
        <span style={statLabel}>Connected trees</span>
        <span style={statValue}>{info.connectedTreeIds.size}</span>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <p style={{ fontSize: '0.8rem', color: COLORS.textMuted, marginBottom: '0.5rem' }}>
          Nutrient flow
        </p>
        {Object.entries(info.nutrientBreakdown).map(([type, count]) => (
          <div key={type} style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.3rem',
          }}>
            <div style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: COLORS[type as keyof typeof COLORS] || '#888',
            }} />
            <span style={{ fontSize: '0.85rem', color: COLORS.text, textTransform: 'capitalize' }}>
              {type}: {count}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

const panelStyle: React.CSSProperties = {
  position: 'fixed',
  right: '1.5rem',
  top: '50%',
  transform: 'translateY(-50%)',
  background: 'rgba(20, 18, 14, 0.85)',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '12px',
  padding: '1.5rem',
  width: 'min(260px, calc(100vw - 3rem))',
  zIndex: 10,
  color: '#F5F0E8',
  pointerEvents: 'none',
}

const speciesStyle: React.CSSProperties = {
  fontSize: '0.85rem',
  fontStyle: 'italic',
  color: '#A09880',
  marginBottom: '1rem',
}

const statRow: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '0.4rem',
}

const statLabel: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#A09880',
}

const statValue: React.CSSProperties = {
  fontSize: '0.85rem',
  color: '#F5F0E8',
  fontWeight: 600,
}
