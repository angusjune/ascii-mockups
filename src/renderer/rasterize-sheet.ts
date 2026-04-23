import type { SheetShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { layoutText } from './text-layout'

export function rasterizeSheet(shape: SheetShape): CellPatch {
  const { x, y, w, h, title, body } = shape
  const g = BOX.rounded
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  if (h <= 0 || w <= 0) return { x, y, w, h, cells }

  // Row 0: centered grabber handle, evoking a bottom sheet's drag indicator.
  const handle = '═══'
  const hStart = Math.max(0, Math.floor((w - handle.length) / 2))
  for (let i = 0; i < handle.length && hStart + i < w; i++) {
    cells[0][hStart + i] = handle[i]
  }

  // Need at least one row below the grabber for a frame.
  if (h < 2) return { x, y, w, h, cells }

  const boxTop = 1
  const boxBot = h - 1
  // Top border with rounded corners.
  cells[boxTop][0] = g.tl
  for (let c = 1; c < w - 1; c++) cells[boxTop][c] = g.h
  if (w > 1) cells[boxTop][w - 1] = g.tr
  // Bottom border (only if there is a distinct bottom row).
  if (boxBot > boxTop) {
    cells[boxBot][0] = g.bl
    for (let c = 1; c < w - 1; c++) cells[boxBot][c] = g.h
    if (w > 1) cells[boxBot][w - 1] = g.br
  }
  // Side borders.
  for (let r = boxTop + 1; r < boxBot; r++) {
    cells[r][0] = g.v
    if (w > 1) cells[r][w - 1] = g.v
  }

  // Inner rows: title row + divider + body. Only rendered when there is
  // enough vertical room inside the frame.
  const interior = boxBot - boxTop - 1
  if (interior < 1 || w < 3) return { x, y, w, h, cells }
  const titleRow = boxTop + 1
  const titleText = title.length > 0 ? ` ${title} ` : ''
  const titleMax = Math.max(0, w - 2)
  for (let i = 0; i < titleText.length && i < titleMax; i++) {
    cells[titleRow][1 + i] = titleText[i]
  }
  if (interior < 3) return { x, y, w, h, cells }
  const divRow = titleRow + 1
  cells[divRow][0] = '├'
  for (let c = 1; c < w - 1; c++) cells[divRow][c] = g.h
  if (w > 1) cells[divRow][w - 1] = '┤'

  const bodyTop = divRow + 1
  const bodyH = boxBot - bodyTop
  const innerW = Math.max(0, w - 4)
  if (bodyH > 0 && innerW > 0) {
    const bodyCells = layoutText({ text: body, w: innerW, h: bodyH, align: 'left', wrap: true })
    for (let r = 0; r < bodyH; r++) {
      for (let c = 0; c < innerW; c++) cells[bodyTop + r][2 + c] = bodyCells[r][c]
    }
  }

  return { x, y, w, h, cells }
}
