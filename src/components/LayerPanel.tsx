'use client'
import { useEditor } from '@/store/editor-store'
import {
  setSelection,
  updateShape,
  bringForward,
  sendBackward,
  removeShapes,
} from '@/model/doc-ops'

export default function LayerPanel() {
  const doc = useEditor((s) => s.doc)
  const apply = useEditor((s) => s.applyDocChange)
  const shapes = [...doc.shapes].reverse()
  return (
    <div className="space-y-1 text-sm">
      <h3 className="mb-2 font-serif text-base text-olive-gray">Layers</h3>
      {shapes.length === 0 && <p className="text-xs text-stone-gray">No layers.</p>}
      {shapes.map((s) => {
        const selected = doc.selection.includes(s.id)
        return (
          <div
            key={s.id}
            className={
              'flex items-center gap-1 rounded-[6px] px-2 py-1 ' +
              (selected ? 'bg-warm-sand' : 'hover:bg-warm-sand/60')
            }
          >
            <button
              className="flex-1 truncate text-left text-charcoal-warm"
              onClick={() => apply((d) => setSelection(d, [s.id]), { skipHistory: true })}
            >
              <span className="mr-2 text-stone-gray">{s.type}</span>
              {s.name ?? `${s.w}×${s.h}`}
            </button>
            <button
              title="toggle visibility"
              className="px-1 text-stone-gray"
              onClick={() =>
                apply((d) =>
                  updateShape(d, s.id, { hidden: !s.hidden } as never),
                )
              }
            >
              {s.hidden ? '◌' : '●'}
            </button>
            <button
              title="toggle lock"
              className="px-1 text-stone-gray"
              onClick={() =>
                apply((d) =>
                  updateShape(d, s.id, { locked: !s.locked } as never),
                )
              }
            >
              {s.locked ? '🔒' : '🔓'}
            </button>
            <button
              title="bring forward"
              className="px-1 text-stone-gray"
              onClick={() => apply((d) => bringForward(d, s.id))}
            >
              ↑
            </button>
            <button
              title="send backward"
              className="px-1 text-stone-gray"
              onClick={() => apply((d) => sendBackward(d, s.id))}
            >
              ↓
            </button>
            <button
              title="delete"
              className="px-1 text-error-crimson"
              onClick={() => apply((d) => removeShapes(d, [s.id]))}
            >
              ✕
            </button>
          </div>
        )
      })}
    </div>
  )
}
