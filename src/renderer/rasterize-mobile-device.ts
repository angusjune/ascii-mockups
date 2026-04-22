import type { MobileDeviceShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeMobileDevice(shape: MobileDeviceShape): CellPatch {
  const { x, y, w, h, notch } = shape
  const g = BOX.rounded
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
  // status bar inside frame (row 1)
  if (h >= 4) {
    const statusRow = 1
    const left = ' ●●●'
    const right = notch ? '▂▂▂▂ ' : '100% '
    for (let i = 0; i < left.length && i < w - 2; i++) cells[statusRow][1 + i] = left[i]
    for (let i = 0; i < right.length && i < w - 2; i++) {
      const pos = w - 1 - right.length + i
      if (pos > 0 && pos < w - 1) cells[statusRow][pos] = right[i]
    }
    // divider below status bar
    const divRow = 2
    cells[divRow][0] = '├'
    cells[divRow][w - 1] = '┤'
    for (let c = 1; c < w - 1; c++) cells[divRow][c] = '─'
  }
  return { x, y, w, h, cells }
}
