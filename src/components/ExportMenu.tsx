'use client'
import { useState } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { copyText } from '@/lib/clipboard'
import { exportPng, downloadBlob } from '@/lib/png-export'

export default function ExportMenu() {
  const [open, setOpen] = useState(false)
  const doc = useEditor((s) => s.doc)

  const copy = async () => {
    await copyText(toText(render(doc)))
  }
  const downloadTxt = () => {
    const blob = new Blob([toText(render(doc))], { type: 'text/plain' })
    downloadBlob(blob, `${doc.name}.txt`)
  }
  const downloadPng = async () => {
    const blob = await exportPng(doc)
    downloadBlob(blob, `${doc.name}.png`)
  }

  return (
    <div className="relative inline-flex">
      <button
        onClick={copy}
        className="rounded-l-[8px] bg-terracotta px-3 py-1.5 text-sm text-ivory ring-1 ring-terracotta"
      >
        Copy ASCII
      </button>
      <button
        onClick={() => setOpen((o) => !o)}
        className="rounded-r-[8px] bg-warm-sand px-2 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
        aria-label="Export menu"
      >
        ▾
      </button>
      {open && (
        <ul className="absolute right-0 top-full z-10 mt-1 w-48 rounded-[12px] bg-ivory p-2 ring-1 ring-border-warm shadow-whisper">
          <li>
            <button
              className="w-full rounded-[6px] px-2 py-1 text-left text-sm hover:bg-warm-sand"
              onClick={() => {
                downloadTxt()
                setOpen(false)
              }}
            >
              Download .txt
            </button>
          </li>
          <li>
            <button
              className="w-full rounded-[6px] px-2 py-1 text-left text-sm hover:bg-warm-sand"
              onClick={() => {
                downloadPng()
                setOpen(false)
              }}
            >
              Export PNG
            </button>
          </li>
        </ul>
      )}
    </div>
  )
}
