import { useAppStore } from '../../stores/appStore'

export function SpeedSlider() {
  const speed = useAppStore((s) => s.particleSpeed)
  const setSpeed = useAppStore((s) => s.setParticleSpeed)

  return (
    <div>
      <p style={{
        fontSize: '0.75rem',
        color: '#A09880',
        marginBottom: '0.4rem',
      }}>
        Flow Speed: {speed.toFixed(1)}x
      </p>
      <input
        type="range"
        min={0.1}
        max={3}
        step={0.1}
        value={speed}
        onChange={(e) => setSpeed(parseFloat(e.target.value))}
        style={{
          width: '100%',
          accentColor: '#FFB800',
        }}
      />
    </div>
  )
}
