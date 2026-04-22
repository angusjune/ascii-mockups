import { create } from 'zustand'
import type { Doc, Shape, ShapeId, ToolId } from '@/model/types'
import { emptyDoc } from '@/model/types'
import { addShape, setSelection } from '@/model/doc-ops'
import { emptyHistory, pushHistory, type HistoryState } from './history'
import { load, remove, save } from '@/lib/local-storage'

export interface EditorState {
  doc: Doc
  activeTool: ToolId
  hoveredShapeId: ShapeId | null
  draftShape: Shape | null
  isDragging: boolean
  inlineEditShapeId: ShapeId | null
  layout: { leftW: number; rightW: number }
  history: HistoryState

  setActiveTool: (t: ToolId) => void
  setHovered: (id: ShapeId | null) => void
  setDraft: (s: Shape | null) => void
  setDragging: (d: boolean) => void
  setInlineEdit: (id: ShapeId | null) => void
  setLayout: (patch: Partial<{ leftW: number; rightW: number }>) => void

  applyDocChange: (fn: (d: Doc) => Doc, opts?: { skipHistory?: boolean }) => void
  addShapeAndSelect: (shape: Shape) => void
  replaceDoc: (d: Doc) => void

  undo: () => void
  redo: () => void
  beginCoalesce: () => void
  endCoalesce: () => void

  newDoc: () => void
  renameDoc: (name: string) => void
  openDocById: (id: string) => void
  deleteDocById: (id: string) => void

  resetForTest: () => void
}

interface DocIndexEntry {
  id: string
  name: string
  updatedAt: number
}

const DEFAULT_LAYOUT = { leftW: 240, rightW: 280 }

export const useEditor = create<EditorState>((set) => ({
  doc: emptyDoc(),
  activeTool: 'select',
  hoveredShapeId: null,
  draftShape: null,
  isDragging: false,
  inlineEditShapeId: null,
  layout: DEFAULT_LAYOUT,
  history: emptyHistory(),

  setActiveTool: (t) => set({ activeTool: t }),
  setHovered: (id) => set({ hoveredShapeId: id }),
  setDraft: (s) => set({ draftShape: s }),
  setDragging: (d) => set({ isDragging: d }),
  setInlineEdit: (id) => set({ inlineEditShapeId: id }),
  setLayout: (patch) => set((s) => ({ layout: { ...s.layout, ...patch } })),

  applyDocChange: (fn, opts) =>
    set((s) => {
      const prev = s.doc
      const next = fn(prev)
      if (next === prev) return {}
      if (opts?.skipHistory) return { doc: next }
      if (s.history.coalescing) {
        const h =
          s.history.coalesceSnapshot == null
            ? { ...s.history, coalesceSnapshot: prev }
            : s.history
        return { doc: next, history: h }
      }
      return { doc: next, history: pushHistory(s.history, prev) }
    }),

  addShapeAndSelect: (shape) =>
    set((s) => {
      const next = setSelection(addShape(s.doc, shape), [shape.id])
      return { doc: next, history: pushHistory(s.history, s.doc) }
    }),
  replaceDoc: (d) => set({ doc: d }),

  undo: () =>
    set((s) => {
      if (s.history.past.length === 0) return {}
      const past = s.history.past.slice()
      const prev = past.pop()!
      return {
        doc: prev,
        history: { ...s.history, past, future: [...s.history.future, s.doc] },
      }
    }),

  redo: () =>
    set((s) => {
      if (s.history.future.length === 0) return {}
      const future = s.history.future.slice()
      const next = future.pop()!
      return {
        doc: next,
        history: { ...s.history, past: [...s.history.past, s.doc], future },
      }
    }),

  beginCoalesce: () =>
    set((s) => ({
      history: { ...s.history, coalescing: true, coalesceSnapshot: null },
    })),

  endCoalesce: () =>
    set((s) => {
      const snap = s.history.coalesceSnapshot
      if (!s.history.coalescing || snap == null) {
        return { history: { ...s.history, coalescing: false, coalesceSnapshot: null } }
      }
      return {
        history: {
          ...pushHistory(s.history, snap),
          coalescing: false,
          coalesceSnapshot: null,
        },
      }
    }),

  newDoc: () => set({ doc: emptyDoc(), history: emptyHistory() }),

  renameDoc: (name) =>
    set((s) => ({ doc: { ...s.doc, name, updatedAt: Date.now() } })),

  openDocById: (id) => {
    const d = load<Doc>(`ascii-mockups:doc:${id}`)
    if (d) set({ doc: d, history: emptyHistory() })
  },

  deleteDocById: (id) => {
    remove(`ascii-mockups:doc:${id}`)
    const idx = load<DocIndexEntry[]>('ascii-mockups:docs-index') ?? []
    save(
      'ascii-mockups:docs-index',
      idx.filter((e) => e.id !== id),
    )
  },

  resetForTest: () =>
    set({
      doc: emptyDoc(),
      activeTool: 'select',
      hoveredShapeId: null,
      draftShape: null,
      isDragging: false,
      inlineEditShapeId: null,
      layout: DEFAULT_LAYOUT,
      history: emptyHistory(),
    }),
}))
