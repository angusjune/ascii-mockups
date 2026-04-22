import { describe, it, expect } from 'vitest'
import { rasterizeCard } from './rasterize-card'
import type { CardShape } from '@/model/types'

describe('rasterizeCard', () => {
  it('renders title in top border and body text inside', () => {
    const s: CardShape = {
      id: 'c',
      type: 'card',
      x: 0,
      y: 0,
      w: 14,
      h: 5,
      title: 'Title',
      body: 'hello',
      divider: true,
    }
    const lines = rasterizeCard(s).cells.map((r) => r.join(''))
    expect(lines[0].startsWith('┌─ Title ')).toBe(true)
    expect(lines[0].endsWith('┐')).toBe(true)
    expect(lines[2].includes('hello')).toBe(true)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
