'use client'

import TopBar from './TopBar'
import ToolPalette from './ToolPalette'
import Canvas from './Canvas'
import Inspector from './Inspector'
import LayerPanel from './LayerPanel'
import Resizer from './Resizer'
import { useKeyboard } from '@/hooks/useKeyboard'
import { useAutosave } from '@/hooks/useAutosave'
import { useClipboard } from '@/hooks/useClipboard'
import { useEditor } from '@/store/editor-store'

export default function Editor() {
  useKeyboard()
  useClipboard()
  useAutosave()
  const leftW = useEditor((s) => s.layout.leftW)
  const rightW = useEditor((s) => s.layout.rightW)
  const setLayout = useEditor((s) => s.setLayout)
  return (
    <div className="flex h-screen flex-col bg-parchment">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside
          id="tool-palette"
          style={{ width: leftW }}
          className="shrink-0 border-r border-border-cream bg-parchment p-3 overflow-y-auto"
        >
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">
            <ToolPalette />
          </div>
        </aside>
        <Resizer
          side="left"
          value={leftW}
          onChange={(v) => setLayout({ leftW: v })}
          onReset={() => setLayout({ leftW: 240 })}
        />
        <main className="flex-1 overflow-auto p-6">
          <div className="inline-block rounded-[32px] bg-ivory p-6 ring-border-warm shadow-whisper">
            <Canvas />
          </div>
        </main>
        <div className="hidden lg:contents">
          <Resizer
            side="right"
            value={rightW}
            onChange={(v) => setLayout({ rightW: v })}
            onReset={() => setLayout({ rightW: 280 })}
          />
        </div>
        <aside
          id="inspector"
          style={{ width: rightW }}
          className="hidden shrink-0 flex-col gap-3 border-l border-border-cream bg-parchment p-3 overflow-y-auto lg:flex"
        >
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">
            <Inspector />
          </div>
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">
            <LayerPanel />
          </div>
        </aside>
      </div>
    </div>
  )
}
