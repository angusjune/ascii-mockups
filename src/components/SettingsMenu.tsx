'use client'
import { useEditor } from '@/store/editor-store'

export default function SettingsMenu() {
  const doc = useEditor((s) => s.doc)
  const apply = useEditor((s) => s.applyDocChange)
  return (
    <div className="flex items-center gap-2 text-sm text-charcoal-warm">
      <label className="flex items-center gap-1">
        <span className="text-xs text-stone-gray">W</span>
        <input
          className="w-14 rounded bg-pure-white px-1 py-0.5 ring-1 ring-border-warm"
          type="number"
          min={10}
          max={200}
          value={doc.gridW}
          onChange={(e) => apply((d) => ({ ...d, gridW: Math.max(10, Number(e.target.value)) }))}
        />
      </label>
      <label className="flex items-center gap-1">
        <span className="text-xs text-stone-gray">H</span>
        <input
          className="w-14 rounded bg-pure-white px-1 py-0.5 ring-1 ring-border-warm"
          type="number"
          min={5}
          max={120}
          value={doc.gridH}
          onChange={(e) => apply((d) => ({ ...d, gridH: Math.max(5, Number(e.target.value)) }))}
        />
      </label>
    </div>
  )
}
