'use client'
import { useEditor } from '@/store/editor-store'
import OpenDocDropdown from './OpenDocDropdown'
import ExportMenu from './ExportMenu'

export default function TopBar() {
  const name = useEditor((s) => s.doc.name)
  const rename = useEditor((s) => s.renameDoc)
  const newDoc = useEditor((s) => s.newDoc)
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-cream bg-parchment px-4">
      <input
        value={name}
        onChange={(e) => rename(e.target.value)}
        className="bg-transparent font-serif text-[25px] font-medium text-near-black outline-none rounded px-1 focus:ring-1 focus:ring-focus-blue"
        aria-label="Mockup name"
      />
      <div className="flex items-center gap-2">
        <button
          onClick={newDoc}
          className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
        >
          New
        </button>
        <OpenDocDropdown />
        <ExportMenu />
      </div>
    </header>
  )
}
