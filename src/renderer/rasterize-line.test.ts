import { describe, it, expect } from 'vitest'
import { rasterizeLine } from './rasterize-line'
import type { LineShape } from '@/model/types'

describe('rasterizeLine', () => {
  it('draws horizontal line when h=1', () => {
    const s: LineShape = { id: 'l', type: 'line', x: 0, y: 0, w: 4, h: 1, style: 'single' }
    expect(rasterizeLine(s).cells).toEqual([['─', '─', '─', '─']])
  })
  it('draws vertical line when w=1', () => {
    const s: LineShape = { id: 'l', type: 'line', x: 0, y: 0, w: 1, h: 3, style: 'single' }
    expect(rasterizeLine(s).cells).toEqual([['│'], ['│'], ['│']])
  })
  it('draws top-left → bottom-right diagonal when wider than 1', () => {
    const s: LineShape = { id: 'l', type: 'line', x: 0, y: 0, w: 3, h: 3, style: 'single' }
    const cells = rasterizeLine(s).cells
    expect(cells[0][0]).toBe('╲')
    expect(cells[1][1]).toBe('╲')
    expect(cells[2][2]).toBe('╲')
  })
  it('uses ascii glyphs when style=ascii', () => {
    const s: LineShape = { id: 'l', type: 'line', x: 0, y: 0, w: 3, h: 1, style: 'ascii' }
    expect(rasterizeLine(s).cells).toEqual([['-', '-', '-']])
  })
})
