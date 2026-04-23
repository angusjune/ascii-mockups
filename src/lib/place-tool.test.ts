import { describe, it, expect } from 'vitest'
import { buildCenteredShape, buildPlacedShape } from './place-tool'

describe('buildCenteredShape', () => {
  it('centers a rectangle (20x6) on an 80x30 grid', () => {
    const s = buildCenteredShape('rectangle', 80, 30)
    expect(s).toMatchObject({ type: 'rectangle', x: 30, y: 12, w: 20, h: 6 })
  })

  it('clamps to 0 when shape is wider than the grid', () => {
    const s = buildCenteredShape('browser', 10, 10)
    expect(s.x).toBe(0)
    expect(s.y).toBe(0)
  })

  it('produces a fresh shape with a unique id each call', () => {
    const a = buildCenteredShape('button', 80, 30)
    const b = buildCenteredShape('button', 80, 30)
    expect(a.id).not.toBe(b.id)
  })
})

describe('buildPlacedShape', () => {
  it('places at the requested cell when fully in-bounds', () => {
    const s = buildPlacedShape('rectangle', 10, 5, 80, 30)
    expect(s).toMatchObject({ type: 'rectangle', x: 10, y: 5, w: 20, h: 6 })
  })

  it('clamps x/y so the shape stays inside the grid', () => {
    const s = buildPlacedShape('rectangle', 75, 28, 80, 30)
    // rectangle is 20x6, max x = 80-20 = 60, max y = 30-6 = 24
    expect(s.x).toBe(60)
    expect(s.y).toBe(24)
  })

  it('clamps to 0 when shape exceeds grid in either dimension', () => {
    const s = buildPlacedShape('browser', 5, 5, 50, 20)
    expect(s.x).toBe(0)
    expect(s.y).toBe(0)
  })
})
