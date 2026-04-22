import { describe, it, expect } from 'vitest'
import { rasterizeBrowser } from './rasterize-browser'
import type { BrowserMockupShape } from '@/model/types'

describe('rasterizeBrowser', () => {
  it('renders window chrome, traffic lights, and url bar', () => {
    const s: BrowserMockupShape = {
      id: 'b',
      type: 'browser',
      x: 0,
      y: 0,
      w: 30,
      h: 6,
      url: 'https://example.com',
      title: 'Example',
    }
    const lines = rasterizeBrowser(s).cells.map((r) => r.join(''))
    expect(lines[0].startsWith('┌')).toBe(true)
    expect(lines[1].includes('●')).toBe(true)
    expect(lines[1].includes('example.com')).toBe(true)
    expect(lines[2].startsWith('├')).toBe(true)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
