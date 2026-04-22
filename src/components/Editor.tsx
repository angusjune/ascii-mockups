'use client'

import TopBar from './TopBar'
import ToolPalette from './ToolPalette'
import Canvas from './Canvas'
import Inspector from './Inspector'
import { useKeyboard } from '@/hooks/useKeyboard'

export default function Editor() {
  useKeyboard()
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
          <div className="inline-block rounded-[32px] bg-ivory p-6 ring-border-warm shadow-whisper">
            <Canvas />
          </div>
        </main>
        <aside
          id="inspector"
          className="flex w-72 shrink-0 flex-col gap-3 border-l border-border-cream bg-parchment p-3"
        >
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">
            <Inspector />
          </div>
        </aside>
      </div>
    </div>
  )
}
