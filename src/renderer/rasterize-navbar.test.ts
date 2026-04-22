import { describe, it, expect } from 'vitest'
import { rasterizeNavBar } from './rasterize-navbar'
import type { NavBarShape } from '@/model/types'

describe('rasterizeNavBar', () => {
  it('renders box with title and right icons', () => {
    const s: NavBarShape = {
      id: 'n',
      type: 'nav-bar',
      x: 0,
      y: 0,
      w: 30,
      h: 3,
      title: 'Home',
      leftIcon: '☰',
      rightIcons: ['⚙', '⋮'],
    }
    const lines = rasterizeNavBar(s).cells.map((r) => r.join(''))
    expect(lines[0].startsWith('┌')).toBe(true)
    expect(lines[1].includes('Home')).toBe(true)
    expect(lines[1].includes('☰')).toBe(true)
    expect(lines[1].includes('⚙')).toBe(true)
    expect(lines[2].startsWith('└')).toBe(true)
  })
})
