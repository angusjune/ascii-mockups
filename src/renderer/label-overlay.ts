export interface OverlayOpts {
  cells: string[][]
  label: string | undefined
  // Horizontal inset reserved on each side (e.g. 1 to keep a box's left/right border).
  inset: number
}

// Overlays a single-line centered label on the vertical middle of `cells`.
// Only the label's own characters are written — padding around it is left untouched
// so existing glyphs (line/arrow strokes, fills) remain visible on either side.
// Truncates the label to fit the available interior width.
export function overlayCenteredLabel(opts: OverlayOpts): void {
  const { cells, label, inset } = opts
  if (!label) return
  const h = cells.length
  if (h === 0) return
  const w = cells[0].length
  const innerW = w - inset * 2
  if (innerW <= 0) return
  const row = Math.floor((h - 1) / 2)
  const text = label.length > innerW ? label.slice(0, innerW) : label
  const start = inset + Math.floor((innerW - text.length) / 2)
  for (let i = 0; i < text.length; i++) {
    cells[row][start + i] = text[i]
  }
}
