import { describe, it, expect } from 'vitest'
import { rasterizeIcon } from './rasterize-icon'
import type { IconPlaceholderShape } from '@/model/types'

describe('rasterizeIcon', () => {
  it('wraps glyph in brackets', () => {
    const s: IconPlaceholderShape = { id: 'i', type: 'icon', x: 0, y: 0, w: 3, h: 1, glyph: '★' }
    expect(rasterizeIcon(s).cells[0]).toEqual(['[', '★', ']'])
  })
  it('pads to width', () => {
    const s: IconPlaceholderShape = { id: 'i', type: 'icon', x: 0, y: 0, w: 5, h: 1, glyph: '?' }
    expect(rasterizeIcon(s).cells[0].join('')).toBe('[ ? ]')
  })
})
