import type { NavBarShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeNavBar(shape: NavBarShape): CellPatch {
  const { x, y, w, h, title, leftIcon, rightIcons } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  cells[0][0] = g.tl
  cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  cells[h - 1][0] = g.bl
  cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  for (let r = 1; r < h - 1; r++) {
    cells[r][0] = g.v
    cells[r][w - 1] = g.v
  }
  const midRow = Math.floor(h / 2)
  if (leftIcon) cells[midRow][2] = leftIcon
  const titleStart = leftIcon ? 4 : 2
  for (let i = 0; i < title.length && titleStart + i < w - 2; i++)
    cells[midRow][titleStart + i] = title[i]
  const icons = rightIcons.join(' ')
  const start = Math.max(titleStart + title.length + 1, w - 2 - icons.length)
  for (let i = 0; i < icons.length && start + i < w - 1; i++) cells[midRow][start + i] = icons[i]
  return { x, y, w, h, cells }
}
