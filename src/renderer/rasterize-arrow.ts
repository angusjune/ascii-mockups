import type { ArrowShape } from '@/model/types'
import type { CellPatch } from './compose'
import { LINE, ARROW_HEADS, TRANSPARENT } from './glyphs'

export function rasterizeArrow(shape: ArrowShape): CellPatch {
  const { x, y, w, h, style, direction, head } = shape
  const g = LINE[style]
  const headSet = style === 'ascii' ? ARROW_HEADS.ascii : ARROW_HEADS[head]
  const headChar = headSet[direction]
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(TRANSPARENT))

  const horizontal = direction === 'left' || direction === 'right'
  if (horizontal) {
    const row = Math.floor(h / 2)
    for (let c = 0; c < w; c++) cells[row][c] = g.h
    if (direction === 'right') cells[row][w - 1] = headChar
    else cells[row][0] = headChar
  } else {
    const col = Math.floor(w / 2)
    for (let r = 0; r < h; r++) cells[r][col] = g.v
    if (direction === 'down') cells[h - 1][col] = headChar
    else cells[0][col] = headChar
  }
  return { x, y, w, h, cells }
}
