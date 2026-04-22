import type { EllipseShape } from '@/model/types'
import type { CellPatch } from './compose'
import { TRANSPARENT } from './glyphs'

export function rasterizeEllipse(shape: EllipseShape): CellPatch {
  const { x, y, w, h } = shape
  const cells: string[][] = []
  if (w === 1 && h === 1) return { x, y, w, h, cells: [['o']] }
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w).fill(TRANSPARENT)
    cells.push(row)
  }
  const top = 0,
    bot = h - 1,
    left = 0,
    right = w - 1
  cells[top][left] = '╭'
  cells[top][right] = '╮'
  cells[bot][left] = '╰'
  cells[bot][right] = '╯'
  for (let c = left + 1; c < right; c++) {
    cells[top][c] = '─'
    cells[bot][c] = '─'
  }
  for (let r = top + 1; r < bot; r++) {
    cells[r][left] = '('
    cells[r][right] = ')'
  }
  return { x, y, w, h, cells }
}
