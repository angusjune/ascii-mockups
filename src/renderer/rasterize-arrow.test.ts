import { describe, it, expect } from 'vitest'
import { rasterizeArrow } from './rasterize-arrow'
import type { ArrowShape } from '@/model/types'

describe('rasterizeArrow', () => {
  it('draws a right-pointing arrow on a single row', () => {
    const s: ArrowShape = {
      id: 'a',
      type: 'arrow',
      x: 0,
      y: 0,
      w: 5,
      h: 1,
      direction: 'right',
      style: 'single',
      head: 'single',
    }
    expect(rasterizeArrow(s).cells).toEqual([['─', '─', '─', '─', '→']])
  })
  it('draws a left-pointing arrow with head at start', () => {
    const s: ArrowShape = {
      id: 'a',
      type: 'arrow',
      x: 0,
      y: 0,
      w: 4,
      h: 1,
      direction: 'left',
      style: 'single',
      head: 'single',
    }
    expect(rasterizeArrow(s).cells).toEqual([['←', '─', '─', '─']])
  })
  it('draws a down arrow in a single column', () => {
    const s: ArrowShape = {
      id: 'a',
      type: 'arrow',
      x: 0,
      y: 0,
      w: 1,
      h: 3,
      direction: 'down',
      style: 'single',
      head: 'single',
    }
    expect(rasterizeArrow(s).cells).toEqual([['│'], ['│'], ['↓']])
  })
  it('uses ascii glyphs', () => {
    const s: ArrowShape = {
      id: 'a',
      type: 'arrow',
      x: 0,
      y: 0,
      w: 4,
      h: 1,
      direction: 'right',
      style: 'ascii',
      head: 'single',
    }
    expect(rasterizeArrow(s).cells).toEqual([['-', '-', '-', '>']])
  })
  it('overlays a centered label on a horizontal arrow', () => {
    const s: ArrowShape = {
      id: 'a',
      type: 'arrow',
      x: 0,
      y: 0,
      w: 6,
      h: 1,
      direction: 'right',
      style: 'single',
      head: 'single',
      label: 'go',
    }
    expect(rasterizeArrow(s).cells).toEqual([['─', '─', 'g', 'o', '─', '→']])
  })
})
