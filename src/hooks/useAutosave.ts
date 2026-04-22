'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { save, load } from '@/lib/local-storage'
import type { Doc } from '@/model/types'

interface IndexEntry {
  id: string
  name: string
  updatedAt: number
}

const DOC_KEY = (id: string) => `ascii-mockups:doc:${id}`
const INDEX_KEY = 'ascii-mockups:docs-index'
const CURRENT_KEY = 'ascii-mockups:current-doc-id'
const LAYOUT_KEY = 'ascii-mockups:layout'

export function useAutosave(delayMs = 800) {
  useEffect(() => {
    const currentId = load<string>(CURRENT_KEY)
    if (currentId) {
      const d = load<Doc>(DOC_KEY(currentId))
      if (d) useEditor.getState().replaceDoc(d)
    }
    const layout = load<{ leftW: number; rightW: number }>(LAYOUT_KEY)
    if (layout) useEditor.setState({ layout })

    let docTimer: ReturnType<typeof setTimeout> | null = null
    const unsubDoc = useEditor.subscribe((state, prev) => {
      if (state.doc !== prev.doc) {
        if (docTimer) clearTimeout(docTimer)
        docTimer = setTimeout(() => {
          const d = state.doc
          save(DOC_KEY(d.id), d)
          save(CURRENT_KEY, d.id)
          const existing = load<IndexEntry[]>(INDEX_KEY) ?? []
          const updated: IndexEntry[] = [
            { id: d.id, name: d.name, updatedAt: d.updatedAt },
            ...existing.filter((e) => e.id !== d.id),
          ]
          save(INDEX_KEY, updated)
        }, delayMs)
      }
      if (state.layout !== prev.layout) {
        save(LAYOUT_KEY, state.layout)
      }
    })
    return () => {
      unsubDoc()
      if (docTimer) clearTimeout(docTimer)
    }
  }, [delayMs])
}
