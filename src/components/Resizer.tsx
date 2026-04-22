'use client'
import { useRef } from 'react'

interface Props {
  side: 'left' | 'right'
  value: number
  onChange: (v: number) => void
  onReset: () => void
  min?: number
  max?: number
}

export default function Resizer({ side, value, onChange, onReset, min = 180, max = 480 }: Props) {
  const startRef = useRef<{ x: number; start: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    ;(e.target as Element).setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, start: value }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = startRef.current
    if (!s) return
    const dx = e.clientX - s.x
    const signed = side === 'left' ? dx : -dx
    const next = Math.max(min, Math.min(max, s.start + signed))
    onChange(next)
  }
  const onPointerUp = () => {
    startRef.current = null
  }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const d = e.key === 'ArrowLeft' ? -20 : 20
      const signed = side === 'left' ? d : -d
      onChange(Math.max(min, Math.min(max, value + signed)))
      e.preventDefault()
    }
  }
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={onReset}
      className="w-1 shrink-0 cursor-ew-resize bg-border-cream hover:bg-ring-warm"
    />
  )
}
