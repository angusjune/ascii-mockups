import { describe, it, expect } from 'vitest'
import { emptyGrid, applyPatch, gridToString } from './compose'
import { TRANSPARENT } from './glyphs'

describe('emptyGrid', () => {
  it('creates a grid of spaces with given dimensions', () => {
    const g = emptyGrid(3, 2)
    expect(g).toEqual([[' ',' ',' '],[' ',' ',' ']])
  })
})

describe('applyPatch', () => {
  it('overwrites matching cells', () => {
    const g = emptyGrid(5, 3)
    applyPatch(g, { x: 1, y: 1, w: 2, h: 1, cells: [['A','B']] })
    expect(g[1][1]).toBe('A')
    expect(g[1][2]).toBe('B')
  })
  it('skips transparent cells', () => {
    const g = emptyGrid(3, 1)
    g[0][1] = 'X'
    applyPatch(g, { x: 0, y: 0, w: 3, h: 1, cells: [[ 'A', TRANSPARENT, 'C' ]] })
    expect(g[0]).toEqual(['A', 'X', 'C'])
  })
  it('clips patches crossing the grid boundary', () => {
    const g = emptyGrid(3, 2)
    applyPatch(g, { x: 2, y: 1, w: 3, h: 3, cells: [['a','b','c'],['d','e','f'],['g','h','i']] })
    expect(g[1][2]).toBe('a')
    expect(g).toEqual([[' ',' ',' '],[' ',' ','a']])
  })
  it('clips negative origins', () => {
    const g = emptyGrid(3, 2)
    applyPatch(g, { x: -1, y: -1, w: 3, h: 3, cells: [['a','b','c'],['d','e','f'],['g','h','i']] })
    expect(g[0][0]).toBe('e')
    expect(g[0][1]).toBe('f')
    expect(g[1][0]).toBe('h')
  })
})

describe('gridToString', () => {
  it('joins rows with newlines and trims trailing spaces', () => {
    const g = [['a','b',' '],['c',' ',' ']]
    expect(gridToString(g)).toBe('ab\nc')
  })
  it('replaces stray TRANSPARENT sentinels with spaces before trim', () => {
    const g = [['a', TRANSPARENT, 'c'], [TRANSPARENT, TRANSPARENT, TRANSPARENT]]
    expect(gridToString(g)).toBe('a c\n')
  })
})
