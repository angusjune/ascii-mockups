import { newId } from '@/lib/ids'
import type { Shape, ShapeType } from './types'

export function move<S extends Shape>(shape: S, dx: number, dy: number): S {
  return { ...shape, x: shape.x + dx, y: shape.y + dy }
}

export function resize<S extends Shape>(shape: S, delta: { dw: number; dh: number }): S {
  return {
    ...shape,
    w: Math.max(1, shape.w + delta.dw),
    h: Math.max(1, shape.h + delta.dh),
  }
}

export function duplicateShape<S extends Shape>(shape: S): S {
  return { ...shape, id: newId(), x: shape.x + 1, y: shape.y + 1 }
}

// Minimum cell width needed to display `text` for a text-bearing shape.
// Callers use this to grow (never shrink) the shape's width when text edits come in.
export function minWidthForText(type: ShapeType, text: string): number {
  const longestLine = text.split('\n').reduce((m, l) => Math.max(m, l.length), 0)
  if (type === 'text') return Math.max(1, longestLine)
  if (type === 'button') return Math.max(4, longestLine + 4)
  return 1
}
