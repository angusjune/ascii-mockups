'use client'
import { useEffect, useRef, useState, type RefObject } from 'react'

export interface CellMetrics {
  charW: number
  charH: number
}

export function useCellMetrics(): [RefObject<HTMLSpanElement | null>, CellMetrics] {
  const ref = useRef<HTMLSpanElement | null>(null)
  const [metrics, setMetrics] = useState<CellMetrics>({ charW: 9, charH: 16 })
  useEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      if (rect.width > 0 && rect.height > 0) {
        setMetrics({ charW: rect.width / 2, charH: rect.height })
      }
    }
    const fontsReady = (document as unknown as { fonts?: { ready: Promise<void> } }).fonts?.ready
    if (fontsReady) fontsReady.then(measure)
    else measure()
    measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [])
  return [ref, metrics]
}
