import { describe, it, expect } from 'vitest'
import { rasterizeTabBar } from './rasterize-tabbar'
import type { TabBarShape } from '@/model/types'

describe('rasterizeTabBar', () => {
  it('divides row into equal cells with labels', () => {
    const s: TabBarShape = {
      id: 't',
      type: 'tab-bar',
      x: 0,
      y: 0,
      w: 24,
      h: 3,
      tabs: ['Home', 'Feed', 'Me'],
      active: 1,
    }
    const lines = rasterizeTabBar(s).cells.map((r) => r.join(''))
    expect(lines[0].startsWith('├')).toBe(true)
    expect(lines[1].includes('Home')).toBe(true)
    expect(lines[1].includes('Feed')).toBe(true)
    expect(lines[1].includes('Me')).toBe(true)
    expect(lines[2].startsWith('└')).toBe(true)
  })
})
