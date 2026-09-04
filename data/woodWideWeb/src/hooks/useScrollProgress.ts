import { useEffect } from 'react'
import { useAppStore } from '../stores/appStore'

export function useScrollProgress() {
  const setScrollProgress = useAppStore((s) => s.setScrollProgress)

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      if (maxScroll > 0) {
        setScrollProgress(scrollY / maxScroll)
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener('scroll', handleScroll)
  }, [setScrollProgress])
}
