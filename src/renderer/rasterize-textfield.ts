import type { TextFieldShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeTextField(shape: TextFieldShape): CellPatch {
  const { x, y, w, h, label, placeholder, value } = shape
  const cells: string[][] = []
  const g = BOX.single
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
  // top border
  cells[boxTop][0] = g.tl
  for (let c = 1; c < w - 1; c++) cells[boxTop][c] = g.h
  cells[boxTop][w - 1] = g.tr
  // content row
  const contentRow = boxTop + 1
  if (contentRow < boxBot) {
    cells[contentRow][0] = g.v
    cells[contentRow][w - 1] = g.v
    const text = value.length > 0 ? value : placeholder
    const inner = alignLine(' ' + text, Math.max(0, w - 2), 'left').split('')
    for (let c = 1; c < w - 1; c++) cells[contentRow][c] = inner[c - 1] ?? ' '
  }
  // fill middle empty rows
  for (let r = boxTop + 1; r < boxBot; r++) {
    if (r === contentRow) continue
    cells[r][0] = g.v
    cells[r][w - 1] = g.v
  }
  // bottom border
  cells[boxBot][0] = g.bl
  for (let c = 1; c < w - 1; c++) cells[boxBot][c] = g.h
  cells[boxBot][w - 1] = g.br
  return { x, y, w, h, cells }
}
