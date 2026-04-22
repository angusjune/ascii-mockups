'use client'
import { useMemo } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { useCellMetrics } from '@/hooks/useCellMetrics'

export default function Canvas() {
  const doc = useEditor((s) => s.doc)
  const text = useMemo(() => toText(render(doc)), [doc])
  const [probeRef] = useCellMetrics()
  const display = text || ' '.repeat(doc.gridW) + '\n'.repeat(Math.max(0, doc.gridH - 1))
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
        className="m-0 font-mono leading-[1.1] text-near-black"
        style={{ whiteSpace: 'pre', tabSize: 1 }}
      >
        {display}
      </pre>
    </div>
  )
}
