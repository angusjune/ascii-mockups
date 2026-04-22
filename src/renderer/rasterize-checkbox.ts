import type { CheckboxShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeCheckbox(shape: CheckboxShape): CellPatch {
  const { x, y, w, h, label, checked } = shape
  const prefix = checked ? '[x] ' : '[ ] '
  const text = alignLine(prefix + label, w, 'left')
  const cells: string[][] = [text.split('')]
  for (let r = 1; r < h; r++) cells.push(alignLine('', w, 'left').split(''))
  return { x, y, w, h, cells }
}
