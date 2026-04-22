'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { addShape, setSelection } from '@/model/doc-ops'
import { duplicateShape } from '@/model/shape-ops'
import { copyText } from '@/lib/clipboard'
import { render, toText } from '@/renderer'
import type { Shape, Doc } from '@/model/types'

let shapeBuffer: string | null = null

export function useClipboard() {
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) return
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const st = useEditor.getState()

      if (e.key.toLowerCase() === 'c') {
        if (st.doc.selection.length > 0) {
          e.preventDefault()
          const selected = st.doc.shapes.filter((s) => st.doc.selection.includes(s.id))
          shapeBuffer = JSON.stringify(selected)
        } else {
          e.preventDefault()
          await copyText(toText(render(st.doc)))
        }
      }
      if (e.key.toLowerCase() === 'v' && shapeBuffer) {
        e.preventDefault()
        const arr = JSON.parse(shapeBuffer) as Shape[]
        const ids: string[] = []
        st.applyDocChange((doc) => {
          let next: Doc = doc
          for (const raw of arr) {
            const s = duplicateShape(raw)
            ids.push(s.id)
            next = addShape(next, s)
          }
          return setSelection(next, ids)
        })
      }
      if (e.key.toLowerCase() === 'd' && st.doc.selection.length > 0) {
        e.preventDefault()
        const ids: string[] = []
        st.applyDocChange((doc) => {
          let next: Doc = doc
          for (const raw of doc.shapes.filter((s) => doc.selection.includes(s.id))) {
            const s = duplicateShape(raw)
            ids.push(s.id)
            next = addShape(next, s)
          }
          return setSelection(next, ids)
        })
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault()
        st.applyDocChange((d) => setSelection(d, d.shapes.map((s) => s.id)), {
          skipHistory: true,
        })
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
