import { describe, it, expect } from 'vitest'
import { render, toText } from './index'
import { ALL_TOOLS, emptyDoc } from '@/model/types'
import { createTemplate } from '@/templates'

describe('render', () => {
  it('returns a grid of the doc size for an empty doc', () => {
    const d = emptyDoc()
    const g = render(d)
    expect(g.length).toBe(d.gridH)
    expect(g[0].length).toBe(d.gridW)
    // An empty doc → all rows empty → toText yields gridH-1 newlines
    expect(toText(g)).toBe('\n'.repeat(d.gridH - 1))
  })

  it('skips hidden shapes (no rasterizer needed for this test)', () => {
    const d = emptyDoc()
    // Place an unknown-type shape; registry has none registered, so it's skipped cleanly.
    const hiddenLike = { id:'1', type:'rectangle', x:0, y:0, w:3, h:3, style:'single', hidden: true } as any
    const doc = { ...d, shapes: [hiddenLike] }
    expect(toText(render(doc))).toBe('\n'.repeat(d.gridH - 1))
  })

  // Regression guard: the drag-to-size interaction allows the user to shrink
  // any tool down to 1x1. No rasterizer may crash on tiny shapes.
  it.each(ALL_TOOLS.filter((t) => t !== 'select'))(
    'renders %s at 1x1 without crashing',
    (tool) => {
      const d = emptyDoc()
      const seed = createTemplate(tool, 0, 0)
      const shape = { ...seed, x: 0, y: 0, w: 1, h: 1 }
      expect(() => render({ ...d, shapes: [shape] })).not.toThrow()
    },
  )
})
