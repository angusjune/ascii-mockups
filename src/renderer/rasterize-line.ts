import type { LineShape } from '@/model/types'
import type { CellPatch } from './compose'
import { LINE, TRANSPARENT } from './glyphs'
import { overlayCenteredLabel } from './label-overlay'

export function rasterizeLine(shape: LineShape): CellPatch {
  const { x, y, w, h, style, label } = shape
  const g = LINE[style]
  const cells: string[][] = []
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w).fill(TRANSPARENT)
    cells.push(row)
  }
  if (h === 1) {
    for (let c = 0; c < w; c++) cells[0][c] = g.h
  } else if (w === 1) {
    for (let r = 0; r < h; r++) cells[r][0] = g.v
  } else {
    const steps = Math.max(w, h)
    for (let i = 0; i < steps; i++) {
      const cx = Math.round((i / (steps - 1)) * (w - 1))
      const cy = Math.round((i / (steps - 1)) * (h - 1))
      cells[cy][cx] = g.diagDown
    }
  }
  overlayCenteredLabel({ cells, label, inset: 0 })
  return { x, y, w, h, cells }
}
