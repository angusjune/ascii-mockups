'use client'
import { useCallback, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import type { Shape, ShapeType } from '@/model/types'
import { createTemplate } from '@/templates'
import { setSelection, addShape, updateShape } from '@/model/doc-ops'
import { newId } from '@/lib/ids'

export interface CanvasPointer {
  x: number
  y: number
}

const DRAWING_TOOLS = new Set<ShapeType>(['rectangle', 'ellipse', 'line', 'arrow', 'text'])
const TEMPLATE_TOOLS = new Set<ShapeType>([
  'button',
  'image-placeholder',
  'textfield',
  'textarea',
  'mobile-device',
  'browser',
  'tab-bar',
  'nav-bar',
  'status-bar',
  'checkbox',
  'icon',
  'card',
  'modal',
])

type Interaction =
  | { kind: 'draw'; startX: number; startY: number; shapeId: string }
  | {
      kind: 'move'
      startX: number
      startY: number
      originals: Map<string, { x: number; y: number }>
    }
  | { kind: 'resize'; handle: string; shape: Shape }

export function useTool() {
  const interactionRef = useRef<Interaction | null>(null)

  const onPointerDown = useCallback((p: CanvasPointer, target?: Element | null) => {
    const st = useEditor.getState()
    const tool = st.activeTool
    const handle = target?.closest('[data-handle]')?.getAttribute('data-handle') ?? null

    if (tool === 'select') {
      if (handle) {
        const primary = st.doc.shapes.find((s) => s.id === st.doc.selection[0])
        if (primary) {
          interactionRef.current = { kind: 'resize', handle, shape: primary }
          st.beginCoalesce()
          st.setDragging(true)
          return
        }
      }
      const hit = st.doc.shapes
        .slice()
        .reverse()
        .find(
          (s) =>
            !s.locked &&
            !s.hidden &&
            p.x >= s.x &&
            p.x < s.x + s.w &&
            p.y >= s.y &&
            p.y < s.y + s.h,
        )
      if (hit) {
        const alreadySelected = st.doc.selection.includes(hit.id)
        if (!alreadySelected)
          st.applyDocChange((d) => setSelection(d, [hit.id]), { skipHistory: true })
        const selectionIds = alreadySelected ? st.doc.selection : [hit.id]
        const originals = new Map(
          selectionIds
            .map((id) => {
              const sh = st.doc.shapes.find((s) => s.id === id)
              return sh ? ([id, { x: sh.x, y: sh.y }] as const) : null
            })
            .filter(Boolean) as Array<readonly [string, { x: number; y: number }]>,
        )
        interactionRef.current = { kind: 'move', startX: p.x, startY: p.y, originals }
        st.beginCoalesce()
        st.setDragging(true)
      } else {
        st.applyDocChange((d) => setSelection(d, []), { skipHistory: true })
      }
      return
    }

    if (DRAWING_TOOLS.has(tool as ShapeType)) {
      const id = newId()
      interactionRef.current = { kind: 'draw', startX: p.x, startY: p.y, shapeId: id }
      const seed = createTemplate(tool as ShapeType, p.x, p.y)
      const shape: Shape = { ...seed, id, x: p.x, y: p.y, w: 1, h: 1 }
      st.beginCoalesce()
      st.applyDocChange((d) => addShape(d, shape))
      st.applyDocChange((d) => setSelection(d, [id]))
      st.setDragging(true)
      return
    }

    if (TEMPLATE_TOOLS.has(tool as ShapeType)) {
      const shape = createTemplate(tool as ShapeType, p.x, p.y)
      st.applyDocChange((d) => setSelection(addShape(d, shape), [shape.id]))
      st.setActiveTool('select')
      return
    }
  }, [])

  const onPointerMove = useCallback((p: CanvasPointer) => {
    const st = useEditor.getState()
    const i = interactionRef.current
    if (!i) return

    if (i.kind === 'move') {
      const dx = p.x - i.startX
      const dy = p.y - i.startY
      st.applyDocChange((d) => ({
        ...d,
        shapes: d.shapes.map((s) => {
          const orig = i.originals.get(s.id)
          return orig ? { ...s, x: orig.x + dx, y: orig.y + dy } : s
        }),
      }))
      return
    }
    if (i.kind === 'resize') {
      const s = i.shape
      let x = s.x
      let y = s.y
      let w = s.w
      let h = s.h
      if (i.handle.includes('e')) w = Math.max(1, p.x - s.x + 1)
      if (i.handle.includes('s')) h = Math.max(1, p.y - s.y + 1)
      if (i.handle.includes('w')) {
        const nx = Math.min(p.x, s.x + s.w - 1)
        w = s.x + s.w - nx
        x = nx
      }
      if (i.handle.includes('n')) {
        const ny = Math.min(p.y, s.y + s.h - 1)
        h = s.y + s.h - ny
        y = ny
      }
      st.applyDocChange((d) => ({
        ...d,
        shapes: d.shapes.map((sh) => (sh.id === s.id ? { ...sh, x, y, w, h } : sh)),
      }))
      return
    }
    if (i.kind === 'draw') {
      const sx = i.startX
      const sy = i.startY
      const x = Math.min(sx, p.x)
      const y = Math.min(sy, p.y)
      const w = Math.max(1, Math.abs(p.x - sx) + 1)
      const h = Math.max(1, Math.abs(p.y - sy) + 1)
      st.applyDocChange((d) => updateShape(d, i.shapeId, { x, y, w, h }))
    }
  }, [])

  const onPointerUp = useCallback(() => {
    const st = useEditor.getState()
    const i = interactionRef.current
    if (i) {
      st.endCoalesce()
      st.setDragging(false)
    }
    interactionRef.current = null
    const active = st.activeTool
    if (DRAWING_TOOLS.has(active as ShapeType)) st.setActiveTool('select')
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp }
}
