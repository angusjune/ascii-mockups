import type { Doc, Shape, ShapeId } from './types'

function touched(doc: Doc, patch: Partial<Doc>): Doc {
  return { ...doc, ...patch, updatedAt: Date.now() }
}

export function addShape(doc: Doc, shape: Shape): Doc {
  return touched(doc, { shapes: [...doc.shapes, shape] })
}

export function removeShapes(doc: Doc, ids: ShapeId[]): Doc {
  const set = new Set(ids)
  return touched(doc, {
    shapes: doc.shapes.filter(s => !set.has(s.id)),
    selection: doc.selection.filter(id => !set.has(id)),
  })
}

export function updateShape<S extends Shape>(doc: Doc, id: ShapeId, patch: Partial<S>): Doc {
  let changed = false
  const shapes = doc.shapes.map(s => {
    if (s.id !== id) return s
    changed = true
    return { ...s, ...patch } as Shape
  })
  if (!changed) return doc
  return touched(doc, { shapes })
}

export function setSelection(doc: Doc, ids: ShapeId[]): Doc {
  return { ...doc, selection: ids }
}

function moveInArray<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
  if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= arr.length) return arr
  const copy = arr.slice()
  const [item] = copy.splice(fromIdx, 1)
  copy.splice(toIdx, 0, item)
  return copy
}

export function bringForward(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0 || i === doc.shapes.length - 1) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, i + 1) })
}

export function sendBackward(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i <= 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, i - 1) })
}

export function toFront(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, doc.shapes.length - 1) })
}

export function toBack(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, 0) })
}
