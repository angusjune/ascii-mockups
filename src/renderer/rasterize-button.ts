import type { ButtonShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeButton(shape: ButtonShape): CellPatch {
  const { x, y, w, h, label, variant } = shape
  if (h === 1) {
    const open = variant === 'rounded' ? '(' : variant === 'double' ? '«' : '['
    const close = variant === 'rounded' ? ')' : variant === 'double' ? '»' : ']'
    const inner = alignLine(label, Math.max(0, w - 2), 'center')
    const row = (open + inner + close).split('').slice(0, w)
    while (row.length < w) row.push(' ')
    return { x, y, w, h, cells: [row] }
  }
  const style = variant === 'double' ? 'double' : variant === 'rounded' ? 'rounded' : 'single'
  const g = BOX[style]
  const cells: string[][] = []
  const midRow = Math.floor(h / 2)
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w)
    for (let c = 0; c < w; c++) {
      const isTop = r === 0,
        isBot = r === h - 1
      const isLeft = c === 0,
        isRight = c === w - 1
      if (isTop && isLeft) row[c] = g.tl
      else if (isTop && isRight) row[c] = g.tr
      else if (isBot && isLeft) row[c] = g.bl
      else if (isBot && isRight) row[c] = g.br
      else if (isTop || isBot) row[c] = g.h
      else if (isLeft || isRight) row[c] = g.v
      else row[c] = ' '
    }
    cells.push(row)
  }
  const inner = alignLine(label, Math.max(0, w - 2), 'center')
  for (let c = 1; c < w - 1; c++) cells[midRow][c] = inner[c - 1] ?? ' '
  return { x, y, w, h, cells }
}
