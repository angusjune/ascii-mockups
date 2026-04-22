export const colors = {
  parchment: '#f5f4ed',
  ivory: '#faf9f5',
  pureWhite: '#ffffff',
  warmSand: '#e8e6dc',
  borderCream: '#f0eee6',
  borderWarm: '#e8e6dc',
  ringWarm: '#d1cfc5',
  ringDeep: '#c2c0b6',
  terracotta: '#c96442',
  coral: '#d97757',
  errorCrimson: '#b53333',
  focusBlue: '#3898ec',
  nearBlack: '#141413',
  darkSurface: '#30302e',
  borderDark: '#30302e',
  charcoalWarm: '#4d4c48',
  oliveGray: '#5e5d59',
  stoneGray: '#87867f',
  darkWarm: '#3d3d3a',
  warmSilver: '#b0aea5',
} as const

export type ColorName = keyof typeof colors

export const radii = {
  sharp: '4px',
  subtle: '6px',
  comfy: '8px',
  generous: '12px',
  featured: '16px',
  tag: '24px',
  hero: '32px',
} as const

export const fonts = {
  serif: 'Georgia, "Times New Roman", serif',
  sans: 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif',
  mono: '"SF Mono", "Menlo", "Consolas", "DejaVu Sans Mono", monospace',
} as const
