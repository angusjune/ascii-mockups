import { describe, it, expect } from 'vitest'
import { emptyDoc } from './types'
import {
  addShape, removeShapes, updateShape, setSelection,
  bringForward, sendBackward, toFront, toBack,
} from './doc-ops'
import type { RectangleShape } from './types'

const mkRect = (id: string, x = 0): RectangleShape => ({
  id, type: 'rectangle', x, y: 0, w: 5, h: 3, style: 'single',
})

describe('addShape', () => {
  it('appends shape and updates updatedAt', () => {
    const before = emptyDoc()
    const after = addShape(before, mkRect('a'))
    expect(after.shapes.map(s => s.id)).toEqual(['a'])
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt)
    expect(after).not.toBe(before)
  })
})

describe('removeShapes', () => {
  it('removes by id and clears from selection', () => {
    const doc = setSelection(addShape(addShape(emptyDoc(), mkRect('a')), mkRect('b')), ['a','b'])
    const result = removeShapes(doc, ['a'])
    expect(result.shapes.map(s => s.id)).toEqual(['b'])
    expect(result.selection).toEqual(['b'])
  })
})

describe('updateShape', () => {
  it('merges patch into the shape by id', () => {
    const doc = addShape(emptyDoc(), mkRect('a'))
    const result = updateShape(doc, 'a', { x: 10 } as Partial<RectangleShape>)
    expect(result.shapes[0].x).toBe(10)
  })
  it('no-ops if id not found', () => {
    const doc = addShape(emptyDoc(), mkRect('a'))
    const result = updateShape(doc, 'missing', { x: 10 } as Partial<RectangleShape>)
    expect(result.shapes[0].x).toBe(0)
  })
})

describe('z-order helpers', () => {
  const base = addShape(addShape(addShape(emptyDoc(), mkRect('a')), mkRect('b')), mkRect('c'))
  it('bringForward swaps with next neighbor', () => {
    expect(bringForward(base, 'a').shapes.map(s => s.id)).toEqual(['b','a','c'])
  })
  it('bringForward on topmost is no-op', () => {
    expect(bringForward(base, 'c').shapes.map(s => s.id)).toEqual(['a','b','c'])
  })
  it('sendBackward swaps with prev neighbor', () => {
    expect(sendBackward(base, 'c').shapes.map(s => s.id)).toEqual(['a','c','b'])
  })
  it('toFront moves to end', () => {
    expect(toFront(base, 'a').shapes.map(s => s.id)).toEqual(['b','c','a'])
  })
  it('toBack moves to start', () => {
    expect(toBack(base, 'c').shapes.map(s => s.id)).toEqual(['c','a','b'])
  })
})
