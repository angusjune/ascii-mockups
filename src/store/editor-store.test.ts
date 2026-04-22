import { describe, it, expect, beforeEach } from 'vitest'
import { useEditor } from './editor-store'

describe('editor store', () => {
  beforeEach(() => {
    useEditor.getState().resetForTest()
  })

  it('starts with an empty doc and select tool active', () => {
    const s = useEditor.getState()
    expect(s.doc.shapes).toEqual([])
    expect(s.activeTool).toBe('select')
  })

  it('setActiveTool updates the active tool', () => {
    useEditor.getState().setActiveTool('rectangle')
    expect(useEditor.getState().activeTool).toBe('rectangle')
  })

  it('applyDocChange updates the doc', () => {
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'Renamed' }))
    expect(useEditor.getState().doc.name).toBe('Renamed')
  })

  it('adds a shape via helper and records selection', () => {
    const shape = {
      id: 's1',
      type: 'rectangle',
      x: 0,
      y: 0,
      w: 3,
      h: 3,
      style: 'single',
    } as const
    useEditor.getState().addShapeAndSelect(shape)
    expect(useEditor.getState().doc.shapes.map((s) => s.id)).toEqual(['s1'])
    expect(useEditor.getState().doc.selection).toEqual(['s1'])
  })
})

describe('history', () => {
  beforeEach(() => {
    useEditor.getState().resetForTest()
  })

  it('undo restores previous doc', () => {
    const s0 = useEditor.getState().doc
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'A' }))
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'B' }))
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('A')
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe(s0.name)
  })
  it('redo replays a previously-undone change', () => {
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'A' }))
    useEditor.getState().undo()
    useEditor.getState().redo()
    expect(useEditor.getState().doc.name).toBe('A')
  })
  it('new change clears redo stack', () => {
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'A' }))
    useEditor.getState().undo()
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'B' }))
    useEditor.getState().redo()
    expect(useEditor.getState().doc.name).toBe('B')
  })
  it('skipHistory changes do not push onto past', () => {
    useEditor.getState().applyDocChange((d) => ({ ...d, name: 'A' }), { skipHistory: true })
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('A')
  })
  it('beginCoalesce/endCoalesce collapse many edits into one history entry', () => {
    useEditor.getState().beginCoalesce()
    for (let i = 0; i < 5; i++) {
      useEditor.getState().applyDocChange((d) => ({ ...d, name: String(i) }))
    }
    useEditor.getState().endCoalesce()
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('Untitled Mockup')
  })
})
