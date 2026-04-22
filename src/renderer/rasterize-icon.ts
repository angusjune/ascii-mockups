import type { IconPlaceholderShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeIcon(shape: IconPlaceholderShape): CellPatch {
  const { x, y, w, h, glyph } = shape
  const inner = alignLine(glyph, Math.max(0, w - 2), 'center')
  const row = ('[' + inner + ']').split('').slice(0, w)
  while (row.length < w) row.push(' ')
  const cells: string[][] = [row]
  for (let r = 1; r < h; r++) cells.push(alignLine('', w, 'left').split(''))
  return { x, y, w, h, cells }
}
