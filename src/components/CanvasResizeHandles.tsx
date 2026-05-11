'use client'
import { useRef } from 'react'
import { useEditor } from '@/store/editor-store'

interface Props {
  charW: number
  charH: number
}

type Mode = 'w' | 'h' | 'wh'

interface DragStart {
  clientX: number
  clientY: number
  gridW: number
  gridH: number
  mode: Mode
}

const MIN_W = 10
const MAX_W = 200
const MIN_H = 5
const MAX_H = 120

export default function CanvasResizeHandles({ charW, charH }: Props) {
  const doc = useEditor((s) => s.doc)
  const apply = useEditor((s) => s.applyDocChange)
  const begin = useEditor((s) => s.beginCoalesce)
  const end = useEditor((s) => s.endCoalesce)
  const startRef = useRef<DragStart | null>(null)

  if (charW <= 0 || charH <= 0) return null

  const preW = doc.gridW * charW
  const preH = doc.gridH * charH
  const strip = 6
  const corner = 12

  const startDrag = (e: React.PointerEvent, mode: Mode) => {
    e.stopPropagation()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)
    startRef.current = {
      clientX: e.clientX,
      clientY: e.clientY,
      gridW: doc.gridW,
      gridH: doc.gridH,
      mode,
    }
    begin()
  }
  const onPointerDownW = (e: React.PointerEvent) => startDrag(e, 'w')
  const onPointerDownH = (e: React.PointerEvent) => startDrag(e, 'h')
  const onPointerDownWH = (e: React.PointerEvent) => startDrag(e, 'wh')

  const onPointerMove = (e: React.PointerEvent) => {
    const s = startRef.current
    if (!s) return
    const patch: { gridW?: number; gridH?: number } = {}
    if (s.mode === 'w' || s.mode === 'wh') {
      const dxCells = Math.round((e.clientX - s.clientX) / charW)
      const nextW = Math.max(MIN_W, Math.min(MAX_W, s.gridW + dxCells))
      if (nextW !== doc.gridW) patch.gridW = nextW
    }
    if (s.mode === 'h' || s.mode === 'wh') {
      const dyCells = Math.round((e.clientY - s.clientY) / charH)
      const nextH = Math.max(MIN_H, Math.min(MAX_H, s.gridH + dyCells))
      if (nextH !== doc.gridH) patch.gridH = nextH
    }
    if (patch.gridW == null && patch.gridH == null) return
    apply((d) => ({ ...d, ...patch }))
  }

  const onPointerUp = (e: React.PointerEvent) => {
    if (!startRef.current) return
    ;(e.currentTarget as Element).releasePointerCapture?.(e.pointerId)
    startRef.current = null
    end()
  }

  const baseHandle =
    'absolute bg-transparent hover:bg-ring-warm/60 active:bg-ring-warm transition-colors'

  return (
    <>
      <div
        role="separator"
        aria-label="Resize canvas width"
        aria-orientation="vertical"
        onPointerDown={onPointerDownW}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={baseHandle}
        style={{
          left: preW - strip / 2,
          top: 0,
          width: strip,
          height: preH,
          cursor: 'ew-resize',
          touchAction: 'none',
        }}
      />
      <div
        role="separator"
        aria-label="Resize canvas height"
        aria-orientation="horizontal"
        onPointerDown={onPointerDownH}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={baseHandle}
        style={{
          left: 0,
          top: preH - strip / 2,
          width: preW,
          height: strip,
          cursor: 'ns-resize',
          touchAction: 'none',
        }}
      />
      <div
        role="separator"
        aria-label="Resize canvas"
        onPointerDown={onPointerDownWH}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        className={baseHandle}
        style={{
          left: preW - corner / 2,
          top: preH - corner / 2,
          width: corner,
          height: corner,
          cursor: 'nwse-resize',
          touchAction: 'none',
        }}
      />
    </>
  )
}
