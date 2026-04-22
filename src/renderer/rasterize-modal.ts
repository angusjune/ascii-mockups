import type { ModalShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { layoutText } from './text-layout'

export function rasterizeModal(shape: ModalShape): CellPatch {
  const { x, y, w, h, title, body, actions } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))

  cells[0][0] = g.tl
  cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  const titleText = title.length > 0 ? ` ${title} ` : ''
  for (let i = 0; i < Math.min(titleText.length, w - 4); i++) cells[0][2 + i] = titleText[i]

  cells[h - 1][0] = g.bl
  cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h

  for (let r = 1; r < h - 1; r++) {
    cells[r][0] = g.v
    cells[r][w - 1] = g.v
  }

  const actionRow = h - 2
  const bodyH = actionRow - 1
  const innerW = Math.max(0, w - 4)
  const bodyCells = layoutText({ text: body, w: innerW, h: bodyH, align: 'left', wrap: true })
  for (let r = 0; r < bodyH; r++) {
    for (let c = 0; c < innerW; c++) cells[1 + r][2 + c] = bodyCells[r][c]
  }
  const buttons = actions.map((a) => `[${a}]`).join(' ')
  const start = Math.max(2, w - 2 - buttons.length)
  for (let i = 0; i < buttons.length && start + i < w - 1; i++)
    cells[actionRow][start + i] = buttons[i]
  return { x, y, w, h, cells }
}
