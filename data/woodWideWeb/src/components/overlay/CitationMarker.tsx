import { useAppStore } from '../../stores/appStore'
import { getSourceById } from '../../data/sources'

interface Props {
  sourceIds: string[]
}

export function CitationMarker({ sourceIds }: Props) {
  const setShowSourcesPanel = useAppStore((s) => s.setShowSourcesPanel)

  const label = sourceIds.map(id => {
    const src = getSourceById(id)
    return src ? `${src.authors.split(',')[0].split(' ').pop()} ${src.year}` : id
  }).join('; ')

  return (
    <sup
      onClick={(e) => {
        e.stopPropagation()
        setShowSourcesPanel(true)
      }}
      title={label}
      style={{
        cursor: 'pointer',
        color: '#FFB800',
        fontSize: '0.7em',
        marginLeft: '2px',
        fontWeight: 600,
        opacity: 0.8,
        transition: 'opacity 0.2s ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.opacity = '1' }}
      onMouseLeave={(e) => { e.currentTarget.style.opacity = '0.8' }}
    >
      [{sourceIds.length === 1 ? sourceIds.map(id => {
        const s = getSourceById(id)
        return s ? s.year : id
      }).join('') : sourceIds.length}]
    </sup>
  )
}
