import { describe, it, expect } from 'vitest'
import { rasterizeTextField } from './rasterize-textfield'
import type { TextFieldShape } from '@/model/types'

describe('rasterizeTextField', () => {
  it('renders label, box, and value', () => {
    const s: TextFieldShape = {
      id: 't',
      type: 'textfield',
      x: 0,
      y: 0,
      w: 12,
      h: 4,
      label: 'Email',
      placeholder: '',
      value: 'x@y',
    }
    const c = rasterizeTextField(s).cells.map((r) => r.join(''))
    expect(c[0].startsWith('Email')).toBe(true)
    expect(c[1].startsWith('┌')).toBe(true)
    expect(c[1].endsWith('┐')).toBe(true)
    expect(c[2].includes('x@y')).toBe(true)
    expect(c[3].startsWith('└')).toBe(true)
  })
  it('shows placeholder when value is empty', () => {
    const s: TextFieldShape = {
      id: 't',
      type: 'textfield',
      x: 0,
      y: 0,
      w: 14,
      h: 3,
      label: '',
      placeholder: 'search',
      value: '',
    }
    const c = rasterizeTextField(s).cells.map((r) => r.join(''))
    const full = c.join('\n')
    expect(full.includes('search')).toBe(true)
  })
})
