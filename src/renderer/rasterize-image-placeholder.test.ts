import { describe, it, expect } from 'vitest'
import { rasterizeImagePlaceholder } from './rasterize-image-placeholder'
import type { ImagePlaceholderShape } from '@/model/types'

describe('rasterizeImagePlaceholder', () => {
  it('renders box with diagonal X inside', () => {
    const s: ImagePlaceholderShape = {
      id: 'i',
      type: 'image-placeholder',
      x: 0,
      y: 0,
      w: 5,
      h: 3,
    }
    const c = rasterizeImagePlaceholder(s).cells.map((r) => r.join(''))
    expect(c[0]).toBe('┌───┐')
    expect(c[1][0]).toBe('│')
    expect(c[1][c[1].length - 1]).toBe('│')
    expect(c[1].includes('╳') || c[1].includes('╲') || c[1].includes('╱')).toBe(true)
    expect(c[2]).toBe('└───┘')
  })
})
