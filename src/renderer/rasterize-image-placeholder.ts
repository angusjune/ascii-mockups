import type { ImagePlaceholderShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeImagePlaceholder(shape: ImagePlaceholderShape): CellPatch {
  const { x, y, w, h, caption } = shape
  const g = BOX.single
  const cells: string[][] = []
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
  const innerLeft = 1,
    innerRight = w - 2,
    innerTop = 1,
    innerBot = h - 2
  const iw = innerRight - innerLeft + 1
  const ih = innerBot - innerTop + 1
  if (iw > 0 && ih > 0) {
    const steps = Math.max(iw, ih)
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1)
      const cx1 = innerLeft + Math.round(t * (iw - 1))
      const cy1 = innerTop + Math.round(t * (ih - 1))
      const cx2 = innerRight - Math.round(t * (iw - 1))
      const cy2 = innerTop + Math.round(t * (ih - 1))
      if (cells[cy1][cx1] === ' ') cells[cy1][cx1] = '╲'
      if (cells[cy2][cx2] !== ' ') cells[cy2][cx2] = cells[cy2][cx2] === '╲' ? '╳' : cells[cy2][cx2]
      else cells[cy2][cx2] = '╱'
    }
  }
  if (caption && h >= 3) {
    const row = alignLine(caption.slice(0, w - 2), w - 2, 'center').split('')
    for (let c = 0; c < row.length; c++) cells[h - 2][innerLeft + c] = row[c]
  }
  return { x, y, w, h, cells }
}
