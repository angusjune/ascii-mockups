import { describe, it, expect } from 'vitest'
import { rasterizeEllipse } from './rasterize-ellipse'
import type { EllipseShape } from '@/model/types'

describe('rasterizeEllipse', () => {
  it('renders a small ellipse with rounded corners and curved sides', () => {
    const s: EllipseShape = { id: 'e', type: 'ellipse', x: 0, y: 0, w: 6, h: 3 }
    const cells = rasterizeEllipse(s).cells
    expect(cells[0][0]).toBe('╭')
    expect(cells[0][5]).toBe('╮')
    expect(cells[2][0]).toBe('╰')
    expect(cells[2][5]).toBe('╯')
    expect(cells[1][0]).toBe('(')
    expect(cells[1][5]).toBe(')')
  })
  it('is 1x1 safe (single dot)', () => {
    const s: EllipseShape = { id: 'e', type: 'ellipse', x: 0, y: 0, w: 1, h: 1 }
    expect(rasterizeEllipse(s).cells).toEqual([['o']])
  })
})
