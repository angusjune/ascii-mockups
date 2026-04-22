import { describe, it, expect } from 'vitest'
import { rasterizeMobileDevice } from './rasterize-mobile-device'
import type { MobileDeviceShape } from '@/model/types'

describe('rasterizeMobileDevice', () => {
  it('renders rounded phone outline with status-bar slot', () => {
    const s: MobileDeviceShape = {
      id: 'm',
      type: 'mobile-device',
      x: 0,
      y: 0,
      w: 10,
      h: 6,
      device: 'iphone',
      notch: true,
    }
    const lines = rasterizeMobileDevice(s).cells.map((r) => r.join(''))
    expect(lines[0][0]).toBe('╭')
    expect(lines[0][lines[0].length - 1]).toBe('╮')
    expect(lines[lines.length - 1][0]).toBe('╰')
    expect(lines[1].includes('●')).toBe(true)
  })
})
