import type { RectangleShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX, TRANSPARENT } from './glyphs'

export function rasterizeRectangle(shape: RectangleShape): CellPatch {
  const { x, y, w, h, style, fill } = shape
  const g = BOX[style]
  if (w === 1 && h === 1) return { x, y, w, h, cells: [[g.tl]] }
  if (w === 1) {
    const cells: string[][] = []
    for (let i = 0; i < h; i++) cells.push([g.v])
    return { x, y, w, h, cells }
  }
  if (h === 1) {
    const row = new Array(w).fill(g.h)
    return { x, y, w, h, cells: [row] }
  }
  const cells: string[][] = []
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w)
    for (let c = 0; c < w; c++) {
      const isTop = r === 0,
        isBottom = r === h - 1
      const isLeft = c === 0,
        isRight = c === w - 1
      if (isTop && isLeft) row[c] = g.tl
      else if (isTop && isRight) row[c] = g.tr
      else if (isBottom && isLeft) row[c] = g.bl
      else if (isBottom && isRight) row[c] = g.br
      else if (isTop || isBottom) row[c] = g.h
      else if (isLeft || isRight) row[c] = g.v
      else row[c] = fill ?? TRANSPARENT
    }
    cells.push(row)
  }
  return { x, y, w, h, cells }
}
