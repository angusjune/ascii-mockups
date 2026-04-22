'use client'
import { useMemo, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { useCellMetrics } from '@/hooks/useCellMetrics'
import { useTool } from '@/hooks/useTool'
import SelectionOverlay from './SelectionOverlay'

export default function Canvas() {
  const doc = useEditor((s) => s.doc)
  const preRef = useRef<HTMLPreElement>(null)
  const [probeRef, metrics] = useCellMetrics()
  const tool = useTool()
  const text = useMemo(() => toText(render(doc)), [doc])
  const display = text || ' '.repeat(doc.gridW) + '\n'.repeat(Math.max(0, doc.gridH - 1))

  const toCell = (e: React.PointerEvent | React.MouseEvent) => {
    const el = preRef.current
    if (!el || metrics.charW <= 0 || metrics.charH <= 0) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    const x = Math.max(
      0,
      Math.min(doc.gridW - 1, Math.floor((e.clientX - rect.left) / metrics.charW)),
    )
    const y = Math.max(
      0,
      Math.min(doc.gridH - 1, Math.floor((e.clientY - rect.top) / metrics.charH)),
    )
    return { x, y }
  }

  return (
    <div className="relative inline-block">
      <span
        ref={probeRef}
        className="absolute -left-[9999px] font-mono leading-[1.1]"
        aria-hidden
      >
        MM
      </span>
      <pre
        ref={preRef}
        className="m-0 select-none font-mono leading-[1.1] text-near-black"
        style={{ whiteSpace: 'pre', tabSize: 1, cursor: 'crosshair' }}
        onPointerDown={(e) => {
          ;(e.target as Element).setPointerCapture?.(e.pointerId)
          tool.onPointerDown(toCell(e), e.target as Element)
        }}
        onPointerMove={(e) => tool.onPointerMove(toCell(e))}
        onPointerUp={() => tool.onPointerUp()}
      >
        {display}
      </pre>
      <SelectionOverlay charW={metrics.charW} charH={metrics.charH} />
    </div>
  )
}
