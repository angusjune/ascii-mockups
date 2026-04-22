import { newId } from '@/lib/ids'
import type { Shape } from './types'

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
