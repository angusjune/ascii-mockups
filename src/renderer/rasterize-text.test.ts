import { describe, it, expect } from 'vitest'
import { rasterizeText } from './rasterize-text'
import type { TextShape } from '@/model/types'

describe('rasterizeText', () => {
  it('renders left-aligned text row', () => {
    const s: TextShape = {
      id: 't',
      type: 'text',
      x: 0,
      y: 0,
      w: 5,
      h: 1,
      text: 'hi',
      align: 'left',
      wrap: false,
    }
    expect(rasterizeText(s).cells).toEqual([['h', 'i', ' ', ' ', ' ']])
  })
  it('wraps when wrap=true', () => {
    const s: TextShape = {
      id: 't',
      type: 'text',
      x: 0,
      y: 0,
      w: 3,
      h: 2,
      text: 'ab cd ef',
      align: 'left',
      wrap: true,
    }
    expect(rasterizeText(s).cells).toEqual([
      ['a', 'b', ' '],
      ['c', 'd', ' '],
    ])
  })
  it('honors center align', () => {
    const s: TextShape = {
      id: 't',
      type: 'text',
      x: 0,
      y: 0,
      w: 5,
      h: 1,
      text: 'hi',
      align: 'center',
      wrap: false,
    }
    expect(rasterizeText(s).cells).toEqual([[' ', 'h', 'i', ' ', ' ']])
  })
})
