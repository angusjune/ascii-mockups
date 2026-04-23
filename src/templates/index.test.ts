import { describe, it, expect } from 'vitest'
import { createTemplate } from './index'

describe('createTemplate', () => {
  it('mobile-device gets 25x40 default', () => {
    const s = createTemplate('mobile-device', 0, 0)
    expect(s).toMatchObject({ type: 'mobile-device', w: 25, h: 40 })
  })
  it('browser gets 70x30 default', () => {
    expect(createTemplate('browser', 0, 0)).toMatchObject({ type: 'browser', w: 70, h: 30 })
  })
  it('button gets label "Button"', () => {
    expect(createTemplate('button', 0, 0)).toMatchObject({ type: 'button', label: 'Button' })
  })
  it('text gets placeholder text', () => {
    expect(createTemplate('text', 0, 0)).toMatchObject({ type: 'text', text: 'Text' })
  })
  it('assigns a unique id to each', () => {
    const a = createTemplate('rectangle', 0, 0)
    const b = createTemplate('rectangle', 0, 0)
    expect(a.id).not.toBe(b.id)
  })
  it('sheet gets a title, body, and 30x14 default', () => {
    const s = createTemplate('sheet', 0, 0)
    expect(s).toMatchObject({ type: 'sheet', w: 30, h: 14 })
    if (s.type === 'sheet') {
      expect(s.title).toBeDefined()
      expect(s.body).toBeDefined()
    }
  })
})
