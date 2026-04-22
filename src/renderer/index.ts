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
