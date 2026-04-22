'use client'

interface Props {
  charW: number
  charH: number
  cols: number
  rows: number
}

// Graph-paper backdrop sized exactly to the grid extent. Light minor lines at
// every cell; slightly darker major lines every 5 cells.
export default function GridBackground({ charW, charH, cols, rows }: Props) {
  if (charW <= 0 || charH <= 0) return null
  const width = cols * charW
  const height = rows * charH
  const minor = 'rgba(60, 60, 50, 0.08)'
  const major = 'rgba(60, 60, 50, 0.18)'
  const bg = `
    repeating-linear-gradient(
      to right,
      ${minor} 0px,
      ${minor} 1px,
      transparent 1px,
      transparent ${charW}px
    ),
    repeating-linear-gradient(
      to bottom,
      ${minor} 0px,
      ${minor} 1px,
      transparent 1px,
      transparent ${charH}px
    ),
    repeating-linear-gradient(
      to right,
      ${major} 0px,
      ${major} 1px,
      transparent 1px,
      transparent ${charW * 5}px
    ),
    repeating-linear-gradient(
      to bottom,
      ${major} 0px,
      ${major} 1px,
      transparent 1px,
      transparent ${charH * 5}px
    )
  `
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute left-0 top-0"
      style={{ width, height, backgroundImage: bg }}
    />
  )
}
