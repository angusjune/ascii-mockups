import type { CardShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { layoutText } from './text-layout'

export function rasterizeCard(shape: CardShape): CellPatch {
  const { x, y, w, h, title, body, divider } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  cells[0][0] = g.tl
  const titleText = title.length > 0 ? ` ${title} ` : ''
  const start = 2
  const maxTitleLen = Math.max(0, w - 4)
  const clipped = titleText.slice(0, maxTitleLen)
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  for (let i = 0; i < clipped.length; i++) cells[0][start + i] = clipped[i]
  cells[0][w - 1] = g.tr
  const contentTop = divider && h >= 4 ? 2 : 1
  if (divider && h >= 4) {
    cells[1][0] = g.v
    cells[1][w - 1] = g.v
  }
  const innerW = Math.max(0, w - 4)
  const innerH = Math.max(0, h - 1 - contentTop)
  const bodyCells = layoutText({ text: body, w: innerW, h: innerH, align: 'left', wrap: true })
  for (let r = 0; r < innerH; r++) {
    const gy = contentTop + r
    cells[gy][0] = g.v
    cells[gy][w - 1] = g.v
    for (let c = 0; c < innerW; c++) cells[gy][2 + c] = bodyCells[r][c]
  }
  cells[h - 1][0] = g.bl
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  cells[h - 1][w - 1] = g.br
  return { x, y, w, h, cells }
}
