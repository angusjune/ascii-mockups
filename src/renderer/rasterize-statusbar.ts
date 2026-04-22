import type { MobileStatusBarShape } from '@/model/types'
import type { CellPatch } from './compose'

export function rasterizeStatusBar(shape: MobileStatusBarShape): CellPatch {
  const { x, y, w, h, time, battery, signal } = shape
  const left = ` ${time}`
  const sig = '●'.repeat(Math.max(0, Math.min(5, signal))) + '○'.repeat(Math.max(0, 5 - signal))
  const right = `${sig} ${battery}% `
  const middle = ' '.repeat(Math.max(0, w - left.length - right.length))
  const line = (left + middle + right).slice(0, w).padEnd(w, ' ')
  const cells: string[][] = [line.split('')]
  for (let r = 1; r < h; r++) cells.push(new Array(w).fill(' '))
  return { x, y, w, h, cells }
}
