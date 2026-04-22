import type { TextShape } from '@/model/types'
import type { CellPatch } from './compose'
import { layoutText } from './text-layout'

export function rasterizeText(shape: TextShape): CellPatch {
  const cells = layoutText({
    text: shape.text,
    w: shape.w,
    h: shape.h,
    align: shape.align,
    wrap: shape.wrap,
  })
  return { x: shape.x, y: shape.y, w: shape.w, h: shape.h, cells }
}
