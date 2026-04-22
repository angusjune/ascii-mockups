export type ShapeId = string
export type ToolId =
  | 'select'
  | 'rectangle' | 'ellipse' | 'line' | 'arrow' | 'text'
  | 'button' | 'image-placeholder' | 'textfield' | 'textarea'
  | 'mobile-device' | 'browser' | 'tab-bar' | 'nav-bar'
  | 'status-bar' | 'checkbox' | 'icon' | 'card' | 'modal'

export type ShapeType = Exclude<ToolId, 'select'>

export interface ShapeBase {
  id: ShapeId
  type: ShapeType
  x: number; y: number
  w: number; h: number
  locked?: boolean
  hidden?: boolean
  name?: string
}

export interface RectangleShape extends ShapeBase {
  type: 'rectangle'
  style: 'single' | 'double' | 'rounded' | 'bold' | 'ascii'
  fill?: string
}
export interface EllipseShape extends ShapeBase { type: 'ellipse' }
export interface LineShape extends ShapeBase {
  type: 'line'
  style: 'single' | 'double' | 'ascii'
}
export interface ArrowShape extends ShapeBase {
  type: 'arrow'
  direction: 'up' | 'down' | 'left' | 'right'
  style: 'single' | 'double' | 'ascii'
  head: 'single' | 'double'
}
export interface TextShape extends ShapeBase {
  type: 'text'
  text: string
  align: 'left' | 'center' | 'right'
  wrap: boolean
}
export interface ButtonShape extends ShapeBase {
  type: 'button'
  label: string
  variant: 'square' | 'rounded' | 'double'
}
export interface ImagePlaceholderShape extends ShapeBase {
  type: 'image-placeholder'
  caption?: string
}
export interface TextFieldShape extends ShapeBase {
  type: 'textfield'
  label: string
  placeholder: string
  value: string
}
export interface TextAreaShape extends ShapeBase {
  type: 'textarea'
  label: string
  value: string
  rows: number
}
export interface MobileDeviceShape extends ShapeBase {
  type: 'mobile-device'
  device: 'iphone' | 'android'
  notch: boolean
}
export interface BrowserMockupShape extends ShapeBase {
  type: 'browser'
  url: string
  title: string
}
export interface TabBarShape extends ShapeBase {
  type: 'tab-bar'
  tabs: string[]
  active: number
}
export interface NavBarShape extends ShapeBase {
  type: 'nav-bar'
  title: string
  leftIcon?: string
  rightIcons: string[]
}
export interface MobileStatusBarShape extends ShapeBase {
  type: 'status-bar'
  time: string
  battery: number
  signal: number
}
export interface CheckboxShape extends ShapeBase {
  type: 'checkbox'
  label: string
  checked: boolean
}
export interface IconPlaceholderShape extends ShapeBase {
  type: 'icon'
  glyph: string
}
export interface CardShape extends ShapeBase {
  type: 'card'
  title: string
  body: string
  divider: boolean
}
export interface ModalShape extends ShapeBase {
  type: 'modal'
  title: string
  body: string
  actions: string[]
}

export type Shape =
  | RectangleShape | EllipseShape | LineShape | ArrowShape | TextShape
  | ButtonShape | ImagePlaceholderShape | TextFieldShape | TextAreaShape
  | MobileDeviceShape | BrowserMockupShape | TabBarShape | NavBarShape
  | MobileStatusBarShape | CheckboxShape | IconPlaceholderShape
  | CardShape | ModalShape

export interface Doc {
  id: string
  name: string
  gridW: number
  gridH: number
  shapes: Shape[]
  selection: ShapeId[]
  schemaVersion: 1
  createdAt: number
  updatedAt: number
}

export function emptyDoc(name = 'Untitled Mockup'): Doc {
  const now = Date.now()
  return {
    id: cryptoRandomId(),
    name,
    gridW: 80,
    gridH: 30,
    shapes: [],
    selection: [],
    schemaVersion: 1,
    createdAt: now,
    updatedAt: now,
  }
}

function cryptoRandomId(): string {
  return Math.random().toString(36).slice(2, 12)
}
