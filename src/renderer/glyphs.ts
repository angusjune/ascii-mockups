export const BOX = {
  single:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double:  { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  bold:    { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  ascii:   { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
} as const

export type BoxStyle = keyof typeof BOX

export const LINE = {
  single: { h: '─', v: '│', diagUp: '╱', diagDown: '╲' },
  double: { h: '═', v: '║', diagUp: '╱', diagDown: '╲' },
  ascii:  { h: '-', v: '|', diagUp: '/', diagDown: '\\' },
} as const
export type LineStyle = keyof typeof LINE

export const ARROW_HEADS = {
  single: { up: '↑', down: '↓', left: '←', right: '→' },
  double: { up: '⇑', down: '⇓', left: '⇐', right: '⇒' },
  ascii:  { up: '^', down: 'v', left: '<', right: '>' },
} as const

export const TRANSPARENT = '\0'
