'use client'

import TopBar from './TopBar'
import ToolPalette from './ToolPalette'

export default function Editor() {
  return (
    <div className="flex h-screen flex-col bg-parchment">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside
          id="tool-palette"
          className="w-60 shrink-0 border-r border-border-cream bg-parchment p-3"
        >
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">
            <ToolPalette />
          </div>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto inline-block rounded-[32px] bg-ivory p-6 ring-border-warm shadow-whisper">
            <pre className="font-mono text-near-black leading-[1.1]">{`(canvas goes here)`}</pre>
          </div>
        </main>
        <aside
          id="inspector"
          className="w-72 shrink-0 border-l border-border-cream bg-parchment p-3"
        >
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">Inspector</div>
        </aside>
      </div>
    </div>
  )
}
