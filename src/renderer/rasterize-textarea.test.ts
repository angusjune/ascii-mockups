import { describe, it, expect } from 'vitest'
import { rasterizeTextArea } from './rasterize-textarea'
import type { TextAreaShape } from '@/model/types'

describe('rasterizeTextArea', () => {
  it('renders multi-line box with wrapped value', () => {
    const s: TextAreaShape = {
      id: 't',
      type: 'textarea',
      x: 0,
      y: 0,
      w: 10,
      h: 5,
      label: 'Notes',
      value: 'one two three',
      rows: 3,
    }
    const c = rasterizeTextArea(s).cells.map((r) => r.join(''))
    expect(c[0].startsWith('Notes')).toBe(true)
    expect(c[1].startsWith('┌')).toBe(true)
    expect(c[c.length - 1].startsWith('└')).toBe(true)
  })
  it('does not crash at h=1 with a label', () => {
    const s: TextAreaShape = {
      id: 't',
      type: 'textarea',
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      label: 'Notes',
      value: '',
      rows: 1,
    }
    expect(() => rasterizeTextArea(s)).not.toThrow()
  })
})
