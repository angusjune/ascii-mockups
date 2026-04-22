export function wrapText(text: string, width: number): string[] {
  if (width <= 0) return ['']
  const paragraphs = text.split('\n')
  const out: string[] = []
  for (const p of paragraphs) {
    if (p.length === 0) { out.push(''); continue }
    const words = p.split(' ')
    let line = ''
    for (const w of words) {
      if (w.length > width) {
        if (line) { out.push(line); line = '' }
        for (let i = 0; i < w.length; i += width) out.push(w.slice(i, i + width))
        line = out.pop() ?? ''
        if (line.length === width) { out.push(line); line = '' }
        continue
      }
      const next = line.length === 0 ? w : line + ' ' + w
      if (next.length <= width) line = next
      else { out.push(line); line = w }
    }
    if (line) out.push(line)
  }
  return out
}

export function alignLine(
  line: string, width: number, align: 'left' | 'center' | 'right',
): string {
  if (line.length >= width) return line.slice(0, width)
  const pad = width - line.length
  if (align === 'left') return line + ' '.repeat(pad)
  if (align === 'right') return ' '.repeat(pad) + line
  const left = Math.floor(pad / 2)
  const right = pad - left
  return ' '.repeat(left) + line + ' '.repeat(right)
}

export interface LayoutOpts {
  text: string
  w: number
  h: number
  align: 'left' | 'center' | 'right'
  wrap: boolean
}

export function layoutText(opts: LayoutOpts): string[][] {
  const { text, w, h, align, wrap } = opts
  const rawLines = wrap ? wrapText(text, w) : text.split('\n')
  const rows: string[][] = []
  for (let i = 0; i < h; i++) {
    const line = rawLines[i] ?? ''
    rows.push(alignLine(line, w, align).split(''))
  }
  return rows
}
