'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { removeShapes } from '@/model/doc-ops'
import type { ToolId } from '@/model/types'

const TOOL_KEY_MAP: Record<string, ToolId> = {
  v: 'select',
  r: 'rectangle',
  o: 'ellipse',
  l: 'line',
  a: 'arrow',
  t: 'text',
  b: 'button',
}

export function useKeyboard() {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return

      const st = useEditor.getState()
      const meta = e.metaKey || e.ctrlKey

      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault()
        if (e.shiftKey) st.redo()
        else st.undo()
        return
      }

      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (st.doc.selection.length > 0) {
          e.preventDefault()
          st.applyDocChange((d) => removeShapes(d, d.selection))
        }
        return
      }

      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        if (st.doc.selection.length === 0) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        st.applyDocChange((d) => ({
          ...d,
          shapes: d.shapes.map((s) =>
            d.selection.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s,
          ),
        }))
        return
      }

      if (e.key === 'Escape') {
        st.applyDocChange((d) => ({ ...d, selection: [] }), { skipHistory: true })
        return
      }

      if (!meta && !e.altKey) {
        const tool = TOOL_KEY_MAP[e.key.toLowerCase()]
        if (tool) st.setActiveTool(tool)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
}
