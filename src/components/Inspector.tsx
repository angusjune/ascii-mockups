'use client'
import { useEditor } from '@/store/editor-store'
import { updateShape } from '@/model/doc-ops'
import { minWidthForText } from '@/model/shape-ops'
import type { Shape } from '@/model/types'

export default function Inspector() {
  const doc = useEditor((s) => s.doc)
  const apply = useEditor((s) => s.applyDocChange)
  const sel = doc.shapes.find((s) => s.id === doc.selection[0])
  if (!sel) return <p className="text-sm text-stone-gray">No selection.</p>
  const onChange = (patch: Partial<Omit<Shape, 'type' | 'id'>>) => {
    let finalPatch: Record<string, unknown> = { ...patch }
    // Auto-grow width for Text and Button when their text content changes.
    if (sel.type === 'text' && typeof finalPatch.text === 'string') {
      finalPatch.w = Math.max(sel.w, minWidthForText(sel.type, finalPatch.text))
    } else if (sel.type === 'button' && typeof finalPatch.label === 'string') {
      finalPatch.w = Math.max(sel.w, minWidthForText(sel.type, finalPatch.label))
    }
    apply((d) => updateShape(d, sel.id, finalPatch as never))
  }

  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-serif text-base capitalize text-olive-gray">
        {sel.type.replace('-', ' ')}
      </h3>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="x" value={sel.x} onChange={(v) => onChange({ x: v })} />
        <NumberField label="y" value={sel.y} onChange={(v) => onChange({ y: v })} />
        <NumberField label="w" value={sel.w} min={1} onChange={(v) => onChange({ w: v })} />
        <NumberField label="h" value={sel.h} min={1} onChange={(v) => onChange({ h: v })} />
      </div>
      <TypeSpecificFields shape={sel} onChange={onChange} />
    </div>
  )
}

function NumberField({
  label,
  value,
  onChange,
  min,
}: {
  label: string
  value: number
  onChange: (v: number) => void
  min?: number
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm focus:outline-none focus:ring-focus-blue"
      />
    </label>
  )
}

function TextField({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">{label}</span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm focus:outline-none focus:ring-focus-blue"
      />
    </label>
  )
}

function SelectField<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string
  value: T
  options: readonly T[]
  onChange: (v: T) => void
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm"
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  )
}

type PartialShape = Partial<Omit<Shape, 'type' | 'id'>>

function TypeSpecificFields({
  shape,
  onChange,
}: {
  shape: Shape
  onChange: (p: PartialShape) => void
}) {
  switch (shape.type) {
    case 'rectangle':
      return (
        <SelectField
          label="style"
          value={shape.style}
          options={['single', 'double', 'rounded', 'bold', 'ascii'] as const}
          onChange={(v) => onChange({ style: v } as PartialShape)}
        />
      )
    case 'text':
      return (
        <>
          <TextField
            label="text"
            value={shape.text}
            onChange={(v) => onChange({ text: v } as PartialShape)}
          />
          <SelectField
            label="align"
            value={shape.align}
            options={['left', 'center', 'right'] as const}
            onChange={(v) => onChange({ align: v } as PartialShape)}
          />
          <label className="flex items-center gap-2 text-xs text-stone-gray">
            <input
              type="checkbox"
              checked={shape.wrap}
              onChange={(e) => onChange({ wrap: e.target.checked } as PartialShape)}
            />
            wrap
          </label>
        </>
      )
    case 'button':
      return (
        <>
          <TextField
            label="label"
            value={shape.label}
            onChange={(v) => onChange({ label: v } as PartialShape)}
          />
          <SelectField
            label="variant"
            value={shape.variant}
            options={['square', 'rounded', 'double'] as const}
            onChange={(v) => onChange({ variant: v } as PartialShape)}
          />
        </>
      )
    case 'checkbox':
      return (
        <>
          <TextField
            label="label"
            value={shape.label}
            onChange={(v) => onChange({ label: v } as PartialShape)}
          />
          <label className="flex items-center gap-2 text-xs text-stone-gray">
            <input
              type="checkbox"
              checked={shape.checked}
              onChange={(e) => onChange({ checked: e.target.checked } as PartialShape)}
            />
            checked
          </label>
        </>
      )
    case 'textfield':
      return (
        <>
          <TextField
            label="label"
            value={shape.label}
            onChange={(v) => onChange({ label: v } as PartialShape)}
          />
          <TextField
            label="placeholder"
            value={shape.placeholder}
            onChange={(v) => onChange({ placeholder: v } as PartialShape)}
          />
          <TextField
            label="value"
            value={shape.value}
            onChange={(v) => onChange({ value: v } as PartialShape)}
          />
        </>
      )
    case 'textarea':
      return (
        <>
          <TextField
            label="label"
            value={shape.label}
            onChange={(v) => onChange({ label: v } as PartialShape)}
          />
          <TextField
            label="value"
            value={shape.value}
            onChange={(v) => onChange({ value: v } as PartialShape)}
          />
        </>
      )
    case 'browser':
      return (
        <>
          <TextField
            label="url"
            value={shape.url}
            onChange={(v) => onChange({ url: v } as PartialShape)}
          />
          <TextField
            label="title"
            value={shape.title}
            onChange={(v) => onChange({ title: v } as PartialShape)}
          />
        </>
      )
    case 'nav-bar':
      return (
        <TextField
          label="title"
          value={shape.title}
          onChange={(v) => onChange({ title: v } as PartialShape)}
        />
      )
    case 'tab-bar':
      return (
        <TextField
          label="tabs (comma)"
          value={shape.tabs.join(',')}
          onChange={(v) =>
            onChange({ tabs: v.split(',').map((t) => t.trim()) } as PartialShape)
          }
        />
      )
    case 'card':
    case 'modal':
      return (
        <>
          <TextField
            label="title"
            value={shape.title}
            onChange={(v) => onChange({ title: v } as PartialShape)}
          />
          <TextField
            label="body"
            value={shape.body}
            onChange={(v) => onChange({ body: v } as PartialShape)}
          />
        </>
      )
    case 'icon':
      return (
        <TextField
          label="glyph"
          value={shape.glyph}
          onChange={(v) => onChange({ glyph: v } as PartialShape)}
        />
      )
    case 'status-bar':
      return (
        <TextField
          label="time"
          value={shape.time}
          onChange={(v) => onChange({ time: v } as PartialShape)}
        />
      )
    default:
      return null
  }
}
