'use client'

import { useEditor } from '@/store/editor-store'
import type { ToolId, ShapeType } from '@/model/types'
import { buildCenteredShape, TOOL_DRAG_MIME } from '@/lib/place-tool'

interface ToolDef {
  id: ToolId
  label: string
  description: string
  preview?: string
  key?: string
}

const BASIC: ToolDef[] = [
  {
    id: 'select',
    label: 'Select',
    key: 'V',
    description: 'Pointer for selection',
  },
  {
    id: 'rectangle',
    label: 'Rectangle',
    key: 'R',
    description: 'Rectangular box outline',
    preview: '+--+\n|  |\n+--+',
  },
  {
    id: 'ellipse',
    label: 'Ellipse',
    key: 'O',
    description: 'Oval or circle shape',
    preview: ' .-.\n(   )\n `-\'',
  },
  {
    id: 'line',
    label: 'Line',
    key: 'L',
    description: 'Straight line segment',
    preview: '────────',
  },
  {
    id: 'arrow',
    label: 'Arrow',
    key: 'A',
    description: 'Line with arrowhead',
    preview: '───────►',
  },
  {
    id: 'text',
    label: 'Text',
    key: 'T',
    description: 'Plain text label',
    preview: 'Text',
  },
]

const TEMPLATES: ToolDef[] = [
  {
    id: 'button',
    label: 'Button',
    key: 'B',
    description: 'A clickable button',
    preview: '[ OK ]',
  },
  {
    id: 'image-placeholder',
    label: 'Image',
    description: 'Image placeholder box',
    preview: '+---+\n| X |\n+---+',
  },
  {
    id: 'textfield',
    label: 'Text Field',
    description: 'Labeled input field',
    preview: 'Label\n[____]',
  },
  {
    id: 'textarea',
    label: 'Text Area',
    description: 'Multi-line text area',
    preview: '[____]\n[____]\n[____]',
  },
  {
    id: 'checkbox',
    label: 'Checkbox',
    description: 'A toggleable checkbox',
    preview: '[x] ...',
  },
  {
    id: 'icon',
    label: 'Icon',
    description: 'Single character glyph',
    preview: ' ★',
  },
  {
    id: 'card',
    label: 'Card',
    description: 'Container with a title',
    preview: '┌Title─┐\n│ ...  │\n└──────┘',
  },
  {
    id: 'modal',
    label: 'Modal',
    description: 'Dialog with actions',
    preview: '╔════╗\n║ OK ║\n╚════╝',
  },
  {
    id: 'sheet',
    label: 'Sheet',
    description: 'Bottom sheet overlay',
    preview: ' ═══\n╭──╮\n│  │',
  },
  {
    id: 'mobile-device',
    label: 'Mobile Device',
    description: 'Phone frame template',
    preview: '┌──┐\n│  │\n│  │\n└──┘',
  },
  {
    id: 'browser',
    label: 'Browser',
    description: 'Browser window frame',
    preview: '● ● ●\n─────\n     ',
  },
  {
    id: 'tab-bar',
    label: 'Tab Bar',
    description: 'Bottom tab navigation',
    preview: '│▪│_│_│',
  },
  {
    id: 'nav-bar',
    label: 'Nav Bar',
    description: 'Top navigation bar',
    preview: '≡ Title ⚙',
  },
  {
    id: 'status-bar',
    label: 'Status Bar',
    description: 'Mobile status bar',
    preview: '9:41  ▮▮',
  },
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
      <div className="flex flex-col gap-2">
        {tools.map((t) => (
          <ToolRow key={t.id} tool={t} active={active === t.id} onPick={onPick} />
        ))}
      </div>
    </section>
  )
}

function ToolRow({
  tool,
  active,
  onPick,
}: {
  tool: ToolDef
  active: boolean
  onPick: (t: ToolId) => void
}) {
  const isPlaceable = tool.id !== 'select'

  const handleDoubleClick = () => {
    if (!isPlaceable) return
    const st = useEditor.getState()
    const shape = buildCenteredShape(tool.id as ShapeType, st.doc.gridW, st.doc.gridH)
    st.addShapeAndSelect(shape)
    st.setActiveTool('select')
  }

  const handleDragStart = (e: React.DragEvent<HTMLButtonElement>) => {
    if (!isPlaceable) {
      e.preventDefault()
      return
    }
    e.dataTransfer.setData(TOOL_DRAG_MIME, tool.id)
    e.dataTransfer.effectAllowed = 'copy'
  }

  return (
    <button
      onClick={() => onPick(tool.id)}
      onDoubleClick={handleDoubleClick}
      draggable={isPlaceable}
      onDragStart={handleDragStart}
      aria-pressed={active}
      title={tool.description}
      className={
        'flex items-center gap-3 rounded-[8px] px-3 py-2 text-left ring-1 ' +
        (active
          ? 'bg-warm-sand ring-terracotta'
          : 'bg-warm-sand ring-ring-warm hover:ring-ring-deep')
      }
    >
      <pre
        aria-hidden
        className="shrink-0 w-16 whitespace-pre font-mono text-[10px] leading-tight text-stone-gray"
      >
        {tool.preview ?? ''}
      </pre>
      <div className="min-w-0 flex-1">
        <div className="flex items-baseline gap-1.5">
          <span className="truncate text-sm font-semibold text-charcoal-warm">{tool.label}</span>
          {tool.key ? (
            <span className="text-[10px] text-stone-gray">{tool.key}</span>
          ) : null}
        </div>
        <div className="truncate text-xs text-stone-gray">{tool.description}</div>
      </div>
    </button>
  )
}
