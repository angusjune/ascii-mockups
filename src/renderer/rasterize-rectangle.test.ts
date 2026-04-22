import { describe, it, expect } from 'vitest'
import { rasterizeRectangle } from './rasterize-rectangle'
import { TRANSPARENT } from './glyphs'
import type { RectangleShape } from '@/model/types'

const T = TRANSPARENT

describe('rasterizeRectangle', () => {
  it('renders single-style borders with transparent interior', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:1, y:1, w:4, h:3, style:'single' }
    const patch = rasterizeRectangle(shape)
    expect(patch).toEqual({
      x: 1, y: 1, w: 4, h: 3,
      cells: [
        ['┌','─','─','┐'],
        ['│', T , T ,'│'],
        ['└','─','─','┘'],
      ],
    })
  })

  it('renders 1xN as a vertical line', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:1, h:3, style:'single' }
    expect(rasterizeRectangle(shape).cells).toEqual([['│'],['│'],['│']])
  })

  it('renders Nx1 as a horizontal line', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:1, style:'single' }
    expect(rasterizeRectangle(shape).cells).toEqual([['─','─','─']])
  })

  it('fills interior when fill is provided', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:3, style:'ascii', fill:'.' }
    expect(rasterizeRectangle(shape).cells[1]).toEqual(['|','.','|'])
  })

  it('uses the requested style glyphs', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:3, style:'rounded' }
    expect(rasterizeRectangle(shape).cells[0]).toEqual(['╭','─','╮'])
  })
})
