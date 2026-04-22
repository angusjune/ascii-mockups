'use client'
import { useEditor } from '@/store/editor-store'

export default function MarqueeOverlay({
  charW,
  charH,
}: {
  charW: number
  charH: number
}) {
  const marquee = useEditor((s) => s.marquee)
  if (!marquee || charW <= 0 || charH <= 0) return null
  const { x0, y0, x1, y1 } = marquee
  const left = Math.min(x0, x1) * charW
  const top = Math.min(y0, y1) * charH
  const width = (Math.abs(x1 - x0) + 1) * charW
  const height = (Math.abs(y1 - y0) + 1) * charH
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute border border-dashed border-terracotta bg-terracotta/10"
      style={{ left, top, width, height }}
    />
  )
}
