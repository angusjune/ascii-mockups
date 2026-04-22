import { describe, it, expect } from 'vitest'
import { wrapText, alignLine, layoutText } from './text-layout'

describe('wrapText', () => {
  it('preserves short lines', () => {
    expect(wrapText('hello', 10)).toEqual(['hello'])
  })
  it('wraps on word boundaries', () => {
    expect(wrapText('the quick brown fox', 10)).toEqual(['the quick', 'brown fox'])
  })
  it('hard-breaks a word longer than width', () => {
    expect(wrapText('supercalifragilistic', 6)).toEqual(['superc', 'alifra', 'gilist', 'ic'])
  })
  it('handles explicit newlines', () => {
    expect(wrapText('a\nb c', 3)).toEqual(['a', 'b c'])
  })
})

describe('alignLine', () => {
  it('left-aligns with space padding', () => {
    expect(alignLine('hi', 5, 'left')).toBe('hi   ')
  })
  it('center-aligns rounding toward right pad', () => {
    expect(alignLine('ab', 5, 'center')).toBe(' ab  ')
  })
  it('right-aligns', () => {
    expect(alignLine('x', 3, 'right')).toBe('  x')
  })
  it('truncates when longer than width', () => {
    expect(alignLine('abcdef', 3, 'left')).toBe('abc')
  })
})

describe('layoutText', () => {
  it('returns one cell row per line', () => {
    const cells = layoutText({ text: 'ab\ncd', w: 3, h: 2, align: 'left', wrap: false })
    expect(cells).toEqual([['a','b',' '], ['c','d',' ']])
  })
  it('truncates when h is smaller than line count', () => {
    const cells = layoutText({ text: 'a\nb\nc', w: 1, h: 2, align: 'left', wrap: false })
    expect(cells).toEqual([['a'],['b']])
  })
  it('pads with spaces when h is larger than line count', () => {
    const cells = layoutText({ text: 'a', w: 2, h: 2, align: 'left', wrap: false })
    expect(cells).toEqual([['a',' '],[' ',' ']])
  })
})
