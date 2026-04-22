import type { Doc, Shape } from '@/model/types'
import { emptyGrid, applyPatch, gridToString, type CellPatch, type Grid } from './compose'

type Rasterizer<S extends Shape = Shape> = (shape: S) => CellPatch

const registry = new Map<Shape['type'], Rasterizer>()

export function registerRasterizer<T extends Shape['type']>(
  type: T, fn: Rasterizer<Extract<Shape, { type: T }>>,
): void {
  registry.set(type, fn as Rasterizer)
}

export function render(doc: Doc): Grid {
  const grid = emptyGrid(doc.gridW, doc.gridH)
  for (const shape of doc.shapes) {
    if (shape.hidden) continue
    const fn = registry.get(shape.type)
    if (!fn) continue
    applyPatch(grid, fn(shape))
  }
  return grid
}

export function toText(grid: Grid): string {
  return gridToString(grid)
}

export type { Grid, CellPatch }

import { rasterizeRectangle } from './rasterize-rectangle'
import { rasterizeText } from './rasterize-text'
import { rasterizeLine } from './rasterize-line'
import { rasterizeArrow } from './rasterize-arrow'
import { rasterizeEllipse } from './rasterize-ellipse'
import { rasterizeButton } from './rasterize-button'
import { rasterizeCheckbox } from './rasterize-checkbox'
import { rasterizeIcon } from './rasterize-icon'

registerRasterizer('rectangle', rasterizeRectangle)
registerRasterizer('text', rasterizeText)
registerRasterizer('line', rasterizeLine)
registerRasterizer('arrow', rasterizeArrow)
registerRasterizer('ellipse', rasterizeEllipse)
registerRasterizer('button', rasterizeButton)
registerRasterizer('checkbox', rasterizeCheckbox)
registerRasterizer('icon', rasterizeIcon)
