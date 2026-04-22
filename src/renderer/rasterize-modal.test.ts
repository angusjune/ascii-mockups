import { describe, it, expect } from 'vitest'
import { rasterizeModal } from './rasterize-modal'
import type { ModalShape } from '@/model/types'

describe('rasterizeModal', () => {
  it('renders title border, body, and right-aligned action buttons', () => {
    const s: ModalShape = {
      id: 'm',
      type: 'modal',
      x: 0,
      y: 0,
      w: 30,
      h: 6,
      title: 'Confirm',
      body: 'Sure?',
      actions: ['Cancel', 'OK'],
    }
    const lines = rasterizeModal(s).cells.map((r) => r.join(''))
    expect(lines[0]).toMatch(/^┌─ Confirm /)
    expect(lines[lines.length - 2]).toMatch(/\[Cancel\]/)
    expect(lines[lines.length - 2]).toMatch(/\[OK\]/)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
