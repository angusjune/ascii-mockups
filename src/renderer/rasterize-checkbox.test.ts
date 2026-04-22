import { describe, it, expect } from 'vitest'
import { rasterizeCheckbox } from './rasterize-checkbox'
import type { CheckboxShape } from '@/model/types'

describe('rasterizeCheckbox', () => {
  it('renders unchecked box with label', () => {
    const s: CheckboxShape = {
      id: 'c',
      type: 'checkbox',
      x: 0,
      y: 0,
      w: 13,
      h: 1,
      label: 'Subscribe',
      checked: false,
    }
    expect(rasterizeCheckbox(s).cells[0].join('')).toBe('[ ] Subscribe')
  })
  it('renders checked box', () => {
    const s: CheckboxShape = {
      id: 'c',
      type: 'checkbox',
      x: 0,
      y: 0,
      w: 5,
      h: 1,
      label: 'Ok',
      checked: true,
    }
    expect(rasterizeCheckbox(s).cells[0].join('')).toBe('[x] O')
  })
})
