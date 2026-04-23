import { describe, it, expect } from 'vitest'
import { rasterizeSheet } from './rasterize-sheet'
import type { SheetShape } from '@/model/types'

describe('rasterizeSheet', () => {
  it('renders a grabber, rounded frame, title, divider, and body', () => {
    const s: SheetShape = {
      id: 's',
      type: 'sheet',
      x: 0,
      y: 0,
      w: 20,
      h: 8,
      title: 'Details',
      body: 'Swipe down',
    }
    const lines = rasterizeSheet(s).cells.map((r) => r.join(''))
    // Grabber on row 0, centered.
    expect(lines[0]).toMatch(/═══/)
    // Rounded top corners on row 1.
    expect(lines[1].startsWith('╭')).toBe(true)
    expect(lines[1].endsWith('╮')).toBe(true)
    // Title row contains the title text.
    expect(lines[2]).toMatch(/Details/)
    // Divider row uses ├...┤.
    expect(lines[3].startsWith('├')).toBe(true)
    expect(lines[3].endsWith('┤')).toBe(true)
    // Body text appears somewhere below divider.
    expect(lines.slice(4).join('\n')).toMatch(/Swipe/)
    // Rounded bottom corners on the last row.
    expect(lines[lines.length - 1].startsWith('╰')).toBe(true)
    expect(lines[lines.length - 1].endsWith('╯')).toBe(true)
  })

  it('does not crash at tiny sizes (h=1, h=2, 1x1)', () => {
    const base: SheetShape = {
      id: 's',
      type: 'sheet',
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      title: 'T',
      body: 'B',
    }
    expect(() => rasterizeSheet({ ...base, h: 1 })).not.toThrow()
    expect(() => rasterizeSheet({ ...base, h: 2 })).not.toThrow()
    expect(() => rasterizeSheet({ ...base, w: 1, h: 1 })).not.toThrow()
  })
})
