'use client'

import { useEditor } from '@/store/editor-store'
import type { ToolId } from '@/model/types'

interface ToolDef {
  id: ToolId
  label: string
  key?: string
}

const BASIC: ToolDef[] = [
  { id: 'select', label: 'Select', key: 'V' },
  { id: 'rectangle', label: 'Rectangle', key: 'R' },
  { id: 'ellipse', label: 'Ellipse', key: 'O' },
  { id: 'line', label: 'Line', key: 'L' },
  { id: 'arrow', label: 'Arrow', key: 'A' },
  { id: 'text', label: 'Text', key: 'T' },
]

const TEMPLATES: ToolDef[] = [
  { id: 'button', label: 'Button', key: 'B' },
  { id: 'image-placeholder', label: 'Image' },
  { id: 'textfield', label: 'Text Field' },
  { id: 'textarea', label: 'Text Area' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'icon', label: 'Icon' },
  { id: 'card', label: 'Card' },
  { id: 'modal', label: 'Modal' },
  { id: 'mobile-device', label: 'Mobile Device' },
  { id: 'browser', label: 'Browser' },
  { id: 'tab-bar', label: 'Tab Bar' },
  { id: 'nav-bar', label: 'Nav Bar' },
  { id: 'status-bar', label: 'Status Bar' },
]

export default function ToolPalette() {
  const active = useEditor((s) => s.activeTool)
  const setActiveTool = useEditor((s) => s.setActiveTool)
  return (
    <div className="space-y-4">
      <ToolGroup title="Basic" tools={BASIC} active={active} onPick={setActiveTool} />
      <ToolGroup title="Templates" tools={TEMPLATES} active={active} onPick={setActiveTool} />
    </div>
  )
}

function ToolGroup({
  title,
  tools,
  active,
  onPick,
}: {
  title: string
  tools: ToolDef[]
  active: ToolId
  onPick: (t: ToolId) => void
}) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 font-serif text-base text-olive-gray">{title}</h2>
      <div className="grid grid-cols-2 gap-2">
        {tools.map((t) => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            aria-pressed={active === t.id}
            className={
              'rounded-[8px] px-2 py-2 text-left text-sm text-charcoal-warm ring-1 ' +
              (active === t.id
                ? 'bg-warm-sand ring-terracotta'
                : 'bg-warm-sand ring-ring-warm hover:ring-ring-deep')
            }
          >
            {t.label}
            {t.key ? <span className="ml-1 text-xs text-stone-gray">{t.key}</span> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
