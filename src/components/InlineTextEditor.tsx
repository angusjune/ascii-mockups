'use client'
import { useEffect, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import { updateShape } from '@/model/doc-ops'
import type { Shape } from '@/model/types'

export default function InlineTextEditor({
  charW,
  charH,
}: {
  charW: number
  charH: number
}) {
  const doc = useEditor((s) => s.doc)
  const editingId = useEditor((s) => s.inlineEditShapeId)
  const setEditing = useEditor((s) => s.setInlineEdit)
  const apply = useEditor((s) => s.applyDocChange)
  const ref = useRef<HTMLTextAreaElement>(null)
  const s = doc.shapes.find((sh) => sh.id === editingId)
  useEffect(() => {
    ref.current?.focus()
    ref.current?.select()
  }, [editingId])
  if (!s) return null
  const field = textFieldOf(s)
  if (!field) return null
  const value = String((s as unknown as Record<string, unknown>)[field] ?? '')
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) =>
        apply((d) =>
          updateShape(d, s.id, { [field]: e.target.value } as never),
        )
      }
      onBlur={() => setEditing(null)}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault()
          setEditing(null)
        }
      }}
      className="absolute resize-none rounded-sm bg-pure-white p-0 font-mono text-sm text-near-black outline outline-1 outline-terracotta"
      style={{
        left: s.x * charW,
        top: s.y * charH,
        width: s.w * charW,
        height: s.h * charH,
        lineHeight: `${charH}px`,
      }}
    />
  )
}

function textFieldOf(s: Shape): string | null {
  switch (s.type) {
    case 'text':
      return 'text'
    case 'button':
      return 'label'
    case 'checkbox':
      return 'label'
    case 'textfield':
      return 'value'
    case 'textarea':
      return 'value'
    case 'card':
      return 'body'
    case 'modal':
      return 'body'
    case 'nav-bar':
      return 'title'
    case 'browser':
      return 'url'
    default:
      return null
  }
}
