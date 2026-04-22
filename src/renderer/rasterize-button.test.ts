import { describe, it, expect } from 'vitest'
import { rasterizeButton } from './rasterize-button'
import type { ButtonShape } from '@/model/types'

describe('rasterizeButton', () => {
  it('renders a square single-line button', () => {
    const s: ButtonShape = {
      id: 'b',
      type: 'button',
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      label: 'OK',
      variant: 'square',
    }
    const cells = rasterizeButton(s).cells
    expect(cells[0].join('')).toBe('[   OK   ]')
  })
  it('renders a rounded single-line button', () => {
    const s: ButtonShape = {
      id: 'b',
      type: 'button',
      x: 0,
      y: 0,
      w: 10,
      h: 1,
      label: 'OK',
      variant: 'rounded',
    }
    expect(rasterizeButton(s).cells[0].join('')).toBe('(   OK   )')
  })
  it('renders a multi-line framed button', () => {
    const s: ButtonShape = {
      id: 'b',
      type: 'button',
      x: 0,
      y: 0,
      w: 10,
      h: 3,
      label: 'Save',
      variant: 'square',
    }
    const lines = rasterizeButton(s).cells.map((r) => r.join(''))
    expect(lines[0]).toBe('┌────────┐')
    expect(lines[1]).toBe('│  Save  │')
    expect(lines[2]).toBe('└────────┘')
  })
})
