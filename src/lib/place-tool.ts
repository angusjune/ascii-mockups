import { createTemplate } from '@/templates'
import type { Shape, ShapeType } from '@/model/types'

export function buildPlacedShape(
  toolId: ShapeType,
  x: number,
  y: number,
  gridW: number,
  gridH: number,
): Shape {
  const seed = createTemplate(toolId, x, y)
  const cx = Math.max(0, Math.min(gridW - seed.w, x))
  const cy = Math.max(0, Math.min(gridH - seed.h, y))
  return { ...seed, x: cx, y: cy }
}

export function buildCenteredShape(
  toolId: ShapeType,
  gridW: number,
  gridH: number,
): Shape {
  const seed = createTemplate(toolId, 0, 0)
  const cx = Math.max(0, Math.floor((gridW - seed.w) / 2))
  const cy = Math.max(0, Math.floor((gridH - seed.h) / 2))
  return { ...seed, x: cx, y: cy }
}

export const TOOL_DRAG_MIME = 'application/x-ascii-mockups-tool'
