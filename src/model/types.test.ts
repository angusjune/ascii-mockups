import { describe, it, expect } from 'vitest'
import { emptyDoc, isToolId } from './types'

describe('emptyDoc', () => {
  it('has expected defaults', () => {
    const d = emptyDoc()
    expect(d.gridW).toBe(80)
    expect(d.gridH).toBe(30)
    expect(d.shapes).toEqual([])
    expect(d.selection).toEqual([])
    expect(d.schemaVersion).toBe(1)
    expect(d.name).toBe('Untitled Mockup')
  })

  it('accepts a name', () => {
    expect(emptyDoc('Login').name).toBe('Login')
  })
})

describe('isToolId', () => {
  it('accepts known tool ids', () => {
    expect(isToolId('select')).toBe(true)
    expect(isToolId('rectangle')).toBe(true)
    expect(isToolId('mobile-device')).toBe(true)
  })
  it('rejects unknown strings', () => {
    expect(isToolId('')).toBe(false)
    expect(isToolId('foo')).toBe(false)
    expect(isToolId('Rectangle')).toBe(false)
  })
})
