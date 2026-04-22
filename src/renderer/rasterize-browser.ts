import type { BrowserMockupShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeBrowser(shape: BrowserMockupShape): CellPatch {
  const { x, y, w, h, url } = shape
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
  if (h >= 4) {
    const chromeRow = 1
    const left = ' ● ● ●   '
    for (let i = 0; i < left.length && i < w - 2; i++) cells[chromeRow][1 + i] = left[i]
    const urlText = `[ ${url} ]`
    const start = Math.max(left.length + 1, 1)
    const maxLen = Math.max(0, w - 2 - start)
    const shown = urlText.slice(0, maxLen)
    for (let i = 0; i < shown.length; i++) cells[chromeRow][start + i] = shown[i]
    cells[2][0] = '├'
    cells[2][w - 1] = '┤'
    for (let c = 1; c < w - 1; c++) cells[2][c] = '─'
  }
  return { x, y, w, h, cells }
}
