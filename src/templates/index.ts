import { newId } from '@/lib/ids'
import type { Shape, ShapeType } from '@/model/types'

export function createTemplate(type: ShapeType, x: number, y: number): Shape {
  const base = { id: newId(), x, y }
  switch (type) {
    case 'rectangle':
      return { ...base, type, w: 20, h: 6, style: 'single' }
    case 'ellipse':
      return { ...base, type, w: 14, h: 5 }
    case 'line':
      return { ...base, type, w: 20, h: 1, style: 'single' }
    case 'arrow':
      return { ...base, type, w: 10, h: 1, direction: 'right', style: 'single', head: 'single' }
    case 'text':
      return { ...base, type, w: 12, h: 1, text: 'Text', align: 'left', wrap: false }
    case 'button':
      return { ...base, type, w: 14, h: 3, label: 'Button', variant: 'square' }
    case 'image-placeholder':
      return { ...base, type, w: 20, h: 8 }
    case 'textfield':
      return { ...base, type, w: 24, h: 3, label: 'Label', placeholder: 'placeholder', value: '' }
    case 'textarea':
      return { ...base, type, w: 28, h: 6, label: 'Notes', value: '', rows: 4 }
    case 'mobile-device':
      return { ...base, type, w: 25, h: 40, device: 'iphone', notch: true }
    case 'browser':
      return { ...base, type, w: 70, h: 30, url: 'https://example.com', title: 'Example' }
    case 'tab-bar':
      return { ...base, type, w: 28, h: 3, tabs: ['Home', 'Feed', 'New', 'Me'], active: 0 }
    case 'nav-bar':
      return {
        ...base,
        type,
        w: 32,
        h: 3,
        title: 'Title',
        leftIcon: '☰',
        rightIcons: ['⚙', '⋮'],
      }
    case 'status-bar':
      return { ...base, type, w: 25, h: 1, time: '9:41', battery: 100, signal: 4 }
    case 'checkbox':
      return { ...base, type, w: 18, h: 1, label: 'Subscribe', checked: false }
    case 'icon':
      return { ...base, type, w: 3, h: 1, glyph: '★' }
    case 'card':
      return {
        ...base,
        type,
        w: 30,
        h: 10,
        title: 'Card',
        body: 'Body text here.',
        divider: true,
      }
    case 'modal':
      return {
        ...base,
        type,
        w: 40,
        h: 12,
        title: 'Are you sure?',
        body: 'This cannot be undone.',
        actions: ['Cancel', 'OK'],
      }
  }
}
