import type { TabBarShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeTabBar(shape: TabBarShape): CellPatch {
  const { x, y, w, h, tabs, active } = shape
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  const n = Math.max(1, tabs.length)
  const cellW = Math.floor((w - 1) / n)
  const dividers = [0]
  for (let i = 1; i < n; i++) dividers.push(i * cellW)
  dividers.push(w - 1)
  // Top edge with tees
  cells[0][0] = '├'
  for (let c = 1; c < w - 1; c++) cells[0][c] = '─'
  cells[0][w - 1] = '┤'
  for (let i = 1; i < dividers.length - 1; i++) cells[0][dividers[i]] = '┬'
  // Label row
  const midRow = Math.floor(h / 2)
  for (let i = 0; i < n; i++) {
    const leftEdge = dividers[i]
    const rightEdge = dividers[i + 1]
    cells[midRow][leftEdge] = '│'
    cells[midRow][rightEdge] = '│'
    const innerW = Math.max(0, rightEdge - leftEdge - 1)
    const isActive = i === active
    const label = isActive ? '*' + tabs[i] + '*' : tabs[i]
    const text = alignLine(label, innerW, 'center').split('')
    for (let c = 0; c < innerW; c++) cells[midRow][leftEdge + 1 + c] = text[c]
  }
  // Bottom edge
  cells[h - 1][0] = '└'
  cells[h - 1][w - 1] = '┘'
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = '─'
  for (let i = 1; i < dividers.length - 1; i++) cells[h - 1][dividers[i]] = '┴'
  return { x, y, w, h, cells }
}
