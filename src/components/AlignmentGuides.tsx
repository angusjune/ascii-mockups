'use client'
import { useEditor } from '@/store/editor-store'

export default function AlignmentGuides({ charW, charH }: { charW: number; charH: number }) {
  const doc = useEditor((s) => s.doc)
  const isDragging = useEditor((s) => s.isDragging)
  if (!isDragging || doc.selection.length === 0) return null
  const active = doc.shapes.filter((s) => doc.selection.includes(s.id))
  const others = doc.shapes.filter((s) => !doc.selection.includes(s.id) && !s.hidden)
  const xs = new Set<number>()
  const ys = new Set<number>()
  for (const a of active) {
    for (const o of others) {
      for (const ax of [a.x, a.x + a.w - 1]) {
        for (const ox of [o.x, o.x + o.w - 1]) if (ax === ox) xs.add(ax)
      }
      for (const ay of [a.y, a.y + a.h - 1]) {
        for (const oy of [o.y, o.y + o.h - 1]) if (ay === oy) ys.add(ay)
      }
    }
  }
  return (
    <div className="pointer-events-none absolute inset-0">
      {[...xs].map((x) => (
        <div
          key={`x${x}`}
          className="absolute w-px bg-terracotta/70"
          style={{ left: x * charW, top: 0, bottom: 0 }}
        />
      ))}
      {[...ys].map((y) => (
        <div
          key={`y${y}`}
          className="absolute h-px bg-terracotta/70"
          style={{ top: y * charH, left: 0, right: 0 }}
        />
      ))}
    </div>
  )
}
