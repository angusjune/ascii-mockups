import type { TextAreaShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine, layoutText } from './text-layout'

export function rasterizeTextArea(shape: TextAreaShape): CellPatch {
  const { x, y, w, h, label, value } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  if (h <= 0 || w <= 0) return { x, y, w, h, cells }
  // Only reserve a label row if we also have room for at least one box row.
  const hasLabel = label.length > 0 && h >= 2
  const boxTop = hasLabel ? 1 : 0
  const boxBot = h - 1
  if (hasLabel) {
    const row = alignLine(label, w, 'left').split('')
    for (let c = 0; c < w; c++) cells[0][c] = row[c]
  }
  cells[boxTop][0] = g.tl
  cells[boxTop][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[boxTop][c] = g.h
  cells[boxBot][0] = g.bl
  cells[boxBot][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[boxBot][c] = g.h
  const innerW = Math.max(0, w - 4)
  const innerH = Math.max(0, boxBot - boxTop - 1)
  const content = layoutText({ text: value, w: innerW, h: innerH, align: 'left', wrap: true })
  for (let r = 0; r < innerH; r++) {
    const gy = boxTop + 1 + r
    cells[gy][0] = g.v
    cells[gy][w - 1] = g.v
    for (let c = 0; c < innerW; c++) cells[gy][2 + c] = content[r][c]
  }
  return { x, y, w, h, cells }
}
