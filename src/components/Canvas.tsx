'use client'
import { useMemo, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { useCellMetrics } from '@/hooks/useCellMetrics'
import { useTool } from '@/hooks/useTool'
import SelectionOverlay from './SelectionOverlay'
import AlignmentGuides from './AlignmentGuides'
import InlineTextEditor from './InlineTextEditor'
import GridBackground from './GridBackground'
import MarqueeOverlay from './MarqueeOverlay'

export default function Canvas() {
  const doc = useEditor((s) => s.doc)
  const activeTool = useEditor((s) => s.activeTool)
  const preRef = useRef<HTMLPreElement>(null)
  const [probeRef, metrics] = useCellMetrics()
  const tool = useTool()
  const text = useMemo(() => toText(render(doc)), [doc])
  const display = useMemo(() => {
    const lines = text.split('\n')
    const padded: string[] = []
    for (let r = 0; r < doc.gridH; r++) {
      const line = lines[r] ?? ''
      padded.push(line + ' '.repeat(Math.max(0, doc.gridW - line.length)))
    }
    return padded.join('\n')
  }, [text, doc.gridW, doc.gridH])

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
    <div
      className="relative inline-block"
      style={{ cursor: activeTool === 'select' ? 'default' : 'crosshair' }}
      onPointerDown={(e) => {
        ;(e.currentTarget as Element).setPointerCapture?.(e.pointerId)
        tool.onPointerDown(toCell(e), e.target as Element, e.shiftKey)
      }}
      onPointerMove={(e) => tool.onPointerMove(toCell(e))}
      onPointerUp={() => tool.onPointerUp()}
      onDoubleClick={(e) => {
        const c = toCell(e)
        const hit = doc.shapes
          .slice()
          .reverse()
          .find(
            (s) =>
              !s.hidden &&
              c.x >= s.x &&
              c.x < s.x + s.w &&
              c.y >= s.y &&
              c.y < s.y + s.h,
          )
        if (hit) useEditor.getState().setInlineEdit(hit.id)
      }}
    >
      <span
        ref={probeRef}
        className="absolute -left-[9999px] font-mono leading-[1.1]"
        aria-hidden
      >
        MM
      </span>
      <GridBackground
        charW={metrics.charW}
        charH={metrics.charH}
        cols={doc.gridW}
        rows={doc.gridH}
      />
      <pre
        ref={preRef}
        className="relative m-0 select-none font-mono leading-[1.1] text-near-black"
        style={{ whiteSpace: 'pre', tabSize: 1 }}
      >
        {display}
      </pre>
      <SelectionOverlay charW={metrics.charW} charH={metrics.charH} />
      <MarqueeOverlay charW={metrics.charW} charH={metrics.charH} />
      <AlignmentGuides charW={metrics.charW} charH={metrics.charH} />
      <InlineTextEditor charW={metrics.charW} charH={metrics.charH} />
    </div>
  )
}
