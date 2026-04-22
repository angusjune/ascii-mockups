import { TRANSPARENT } from './glyphs'

export type Grid = string[][]

export interface CellPatch {
  x: number
  y: number
  w: number
  h: number
  cells: string[][]
}

export function emptyGrid(w: number, h: number): Grid {
  const g: Grid = []
  for (let y = 0; y < h; y++) {
    const row: string[] = new Array(w)
    for (let x = 0; x < w; x++) row[x] = ' '
    g.push(row)
  }
  return g
}

/**
 * Writes a CellPatch into the grid in place. The grid is mutated; callers must
 * pass a grid they own (e.g., from `emptyGrid`). Cells containing the TRANSPARENT
 * sentinel are skipped. Cells outside grid bounds are clipped.
 */
export function applyPatch(grid: Grid, patch: CellPatch): void {
  const gh = grid.length
  const gw = gh === 0 ? 0 : grid[0].length
  for (let dy = 0; dy < patch.h; dy++) {
    const gy = patch.y + dy
    if (gy < 0 || gy >= gh) continue
    const row = patch.cells[dy]
    if (!row) continue
    for (let dx = 0; dx < patch.w; dx++) {
      const gx = patch.x + dx
      if (gx < 0 || gx >= gw) continue
      const ch = row[dx]
      if (ch === undefined || ch === TRANSPARENT) continue
      grid[gy][gx] = ch
    }
  }
}

export function gridToString(grid: Grid): string {
  return grid
    .map(row => row.map(ch => (ch === TRANSPARENT ? ' ' : ch)).join('').replace(/ +$/, ''))
    .join('\n')
}
