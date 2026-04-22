import { render, toText } from '@/renderer'
import type { Doc } from '@/model/types'

export async function exportPng(doc: Doc, scale = 2): Promise<Blob> {
  const text = toText(render(doc))
  const lines = text.split('\n')
  const cols = Math.max(...lines.map((l) => l.length), doc.gridW)
  const rows = Math.max(lines.length, doc.gridH)
  const charW = 10 * scale
  const charH = 18 * scale
  const canvas = document.createElement('canvas')
  canvas.width = cols * charW
  canvas.height = rows * charH
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('2D canvas context unavailable')
  ctx.fillStyle = '#faf9f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#141413'
  ctx.font = `${14 * scale}px "SF Mono", Menlo, Consolas, monospace`
  ctx.textBaseline = 'top'
  for (let r = 0; r < lines.length; r++) ctx.fillText(lines[r], 0, r * charH)
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('png blob failed'))),
      'image/png',
    )
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
