'use client'
import { useEditor } from '@/store/editor-store'

const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'] as const
export type Handle = (typeof HANDLES)[number]

export default function SelectionOverlay({
  charW,
  charH,
}: {
  charW: number
  charH: number
}) {
  const doc = useEditor((s) => s.doc)
  const selected = doc.shapes.filter((s) => doc.selection.includes(s.id))
  const primary = doc.shapes.find((s) => s.id === doc.selection[0])
  return (
    <div className="pointer-events-none absolute inset-0">
      {selected.map((s) => (
        <div
          key={s.id}
          className="absolute border border-dashed border-terracotta"
          style={{
            left: s.x * charW - 1,
            top: s.y * charH - 1,
            width: s.w * charW + 2,
            height: s.h * charH + 2,
          }}
        />
      ))}
      {primary &&
        HANDLES.map((handle) => {
          const pos = handlePos(handle, primary.x, primary.y, primary.w, primary.h, charW, charH)
          return (
            <div
              key={handle}
              data-handle={handle}
              className="pointer-events-auto absolute h-2 w-2 -translate-x-1 -translate-y-1 border border-terracotta bg-ivory"
              style={{ left: pos.left, top: pos.top, cursor: cursorFor(handle) }}
            />
          )
        })}
    </div>
  )
}

function handlePos(
  handle: Handle,
  x: number,
  y: number,
  w: number,
  h: number,
  cw: number,
  ch: number,
) {
  const L = x * cw,
    T = y * ch,
    R = (x + w) * cw,
    B = (y + h) * ch
  const MX = (L + R) / 2,
    MY = (T + B) / 2
  switch (handle) {
    case 'nw':
      return { left: L, top: T }
    case 'n':
      return { left: MX, top: T }
    case 'ne':
      return { left: R, top: T }
    case 'e':
      return { left: R, top: MY }
    case 'se':
      return { left: R, top: B }
    case 's':
      return { left: MX, top: B }
    case 'sw':
      return { left: L, top: B }
    case 'w':
      return { left: L, top: MY }
  }
}

function cursorFor(h: Handle): string {
  return (
    {
      nw: 'nwse-resize',
      se: 'nwse-resize',
      ne: 'nesw-resize',
      sw: 'nesw-resize',
      n: 'ns-resize',
      s: 'ns-resize',
      e: 'ew-resize',
      w: 'ew-resize',
    } as const
  )[h]
}
