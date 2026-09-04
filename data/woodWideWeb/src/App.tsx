import { useEffect } from 'react'
import { useNetworkData } from './hooks/useNetworkData'
import { useScrollProgress } from './hooks/useScrollProgress'
import { useAppStore } from './stores/appStore'
import { Scene } from './components/canvas/Scene'
import { ScrollNarrative } from './components/overlay/ScrollNarrative'
import { SourcesPanel } from './components/overlay/SourcesPanel'
import { InteractiveHUD } from './components/ui/InteractiveHUD'
import { NodeInfoPanel } from './components/ui/NodeInfoPanel'

export default function App() {
  const network = useNetworkData()
  const mode = useAppStore((s) => s.mode)
  const setIsMobile = useAppStore((s) => s.setIsMobile)

  useScrollProgress()

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [setIsMobile])

  useEffect(() => {
    document.body.style.overflow = mode === 'interactive' ? 'hidden' : 'auto'
    return () => { document.body.style.overflow = 'auto' }
  }, [mode])

  if (!network) {
    return (
      <div style={{
        width: '100vw',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0A0806',
        color: '#A09880',
        fontFamily: "'Georgia', serif",
        fontSize: '1.2rem',
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 40,
            height: 40,
            border: '2px solid rgba(255, 184, 0, 0.2)',
            borderTop: '2px solid #FFB800',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 1rem',
          }} />
          Loading the underground...
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    )
  }

  return (
    <>
      <Scene network={network} />
      {mode === 'narrative' && <ScrollNarrative />}
      <InteractiveHUD />
      <NodeInfoPanel network={network} />
      <SourcesPanel />
      <a
        href="https://dreamfold.dev"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: 'fixed',
          bottom: 12,
          left: 12,
          color: 'rgba(160, 152, 128, 0.5)',
          fontSize: '0.7rem',
          fontFamily: "'Georgia', serif",
          textDecoration: 'none',
          letterSpacing: '0.05em',
          zIndex: 50,
          transition: 'color 0.2s',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.color = 'rgba(255, 184, 0, 0.8)' }}
        onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(160, 152, 128, 0.5)' }}
      >
        dreamfold.dev
      </a>
    </>
  )
}
