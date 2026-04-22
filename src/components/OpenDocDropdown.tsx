'use client'
import { useEffect, useState } from 'react'
import { useEditor } from '@/store/editor-store'
import { load } from '@/lib/local-storage'

interface Entry {
  id: string
  name: string
  updatedAt: number
}

export default function OpenDocDropdown() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Entry[]>([])
  const openDoc = useEditor((s) => s.openDocById)
  const del = useEditor((s) => s.deleteDocById)
  useEffect(() => {
    if (open) setItems(load<Entry[]>('ascii-mockups:docs-index') ?? [])
  }, [open])
  return (
    <div className="relative">
      <button
        className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
        onClick={() => setOpen((o) => !o)}
      >
        Open ▾
      </button>
      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-64 rounded-[12px] bg-ivory p-2 ring-1 ring-border-warm shadow-whisper">
          {items.length === 0 && (
            <li className="px-2 py-1 text-sm text-stone-gray">No saved mockups</li>
          )}
          {items.map((e) => (
            <li
              key={e.id}
              className="flex items-center justify-between rounded-[6px] px-2 py-1 text-sm hover:bg-warm-sand"
            >
              <button
                className="flex-1 text-left text-charcoal-warm"
                onClick={() => {
                  openDoc(e.id)
                  setOpen(false)
                }}
              >
                {e.name}{' '}
                <span className="ml-2 text-xs text-stone-gray">{relative(e.updatedAt)}</span>
              </button>
              <button
                className="text-error-crimson"
                onClick={() => {
                  if (confirm(`Delete "${e.name}"?`)) {
                    del(e.id)
                    setItems((items) => items.filter((i) => i.id !== e.id))
                  }
                }}
              >
                ✕
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function relative(ts: number): string {
  const d = (Date.now() - ts) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}
