import { describe, it, expect } from 'vitest'
import { rasterizeStatusBar } from './rasterize-statusbar'
import type { MobileStatusBarShape } from '@/model/types'

describe('rasterizeStatusBar', () => {
  it('shows time on left and battery on right', () => {
    const s: MobileStatusBarShape = {
      id: 's',
      type: 'status-bar',
      x: 0,
      y: 0,
      w: 30,
      h: 1,
      time: '9:41',
      battery: 100,
      signal: 4,
    }
    const line = rasterizeStatusBar(s).cells[0].join('')
    expect(line.startsWith(' 9:41')).toBe(true)
    expect(line.trimEnd().endsWith('100%')).toBe(true)
    expect(line.includes('●')).toBe(true)
  })
})
