import { describe, it, expect } from 'vitest'
import { move, resize, duplicateShape } from './shape-ops'
import type { RectangleShape } from './types'

const rect: RectangleShape = {
  id: 'a', type: 'rectangle', x: 5, y: 5, w: 10, h: 4, style: 'single',
}

describe('move', () => {
  it('returns a new object with dx/dy applied', () => {
    const moved = move(rect, 2, -1)
    expect(moved).not.toBe(rect)
    expect(moved.x).toBe(7)
    expect(moved.y).toBe(4)
    expect(rect.x).toBe(5)
  })
})

describe('resize', () => {
  it('applies size deltas, enforcing min size 1', () => {
    expect(resize(rect, { dw: -20, dh: 0 }).w).toBe(1)
    expect(resize(rect, { dw: 0, dh: -20 }).h).toBe(1)
    expect(resize(rect, { dw: 3, dh: 2 })).toMatchObject({ w: 13, h: 6 })
  })
})

describe('duplicateShape', () => {
  it('returns a clone with new id offset by +1 in x/y', () => {
    const dup = duplicateShape(rect)
    expect(dup.id).not.toBe(rect.id)
    expect(dup.x).toBe(rect.x + 1)
    expect(dup.y).toBe(rect.y + 1)
    expect(dup.type).toBe(rect.type)
  })
})
