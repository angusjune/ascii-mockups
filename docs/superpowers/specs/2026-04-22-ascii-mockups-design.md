# ASCII Mockups Builder — Design Spec

**Date:** 2026-04-22
**Status:** Approved
**Reference:** Inspired by ascii-mockups.com; design language per `DESIGN.md` (Claude/Anthropic).

## Summary

A web-based editor for building ASCII-character mockups that users can copy and paste
anywhere plain text is accepted (README files, terminal output, chat, design docs).
Grid-based canvas, object-mode shapes (select/move/resize/delete), rich template
library, full undo/redo, local persistence, and multiple export formats.

## Goals

- Let a user build a clean ASCII mockup of a UI (web page, mobile app, or generic
  wireframe) in minutes and paste it into plain-text contexts.
- Provide both low-level primitives (rectangle, line, arrow, text) and high-level
  templates (button, browser mockup, mobile device, etc.).
- Keep output deterministic: what you see on canvas is exactly what pastes elsewhere,
  character for character.
- Feel polished and literary, matching the Claude/Anthropic design language.

## Non-Goals (v1)

- Importing ASCII text back into editable shapes (requires shape detection; high
  complexity, low value).
- Real-time collaboration, cloud sync, or share links.
- Mobile touch editing beyond simple template-tap-place; mobile is read/export-oriented.
- Reusable symbols/components, groups, or nested containers beyond the visual effect of
  placing child shapes on top of a container template.
- i18n beyond English.

## Stack

- **Bun** — runtime, package manager, dev script runner
- **Next.js 16** (App Router) + **React 19** + **TypeScript** — single client-rendered
  editor mounted at `/`; no SSR needed. Static export capable.
- **Zustand** — single store for doc + ephemeral UI state
- **Tailwind CSS v4** — UI chrome, keyed to Claude design tokens
- **Vitest** — unit and integration tests
- **Playwright** — committed E2E smoke test
- **Playwright MCP** — used during implementation for direct, per-step browser
  verification (navigate, click, screenshot, extract rendered ASCII). Not a substitute
  for the committed E2E test.
- **No backend.** Persistence via `localStorage`.

## Architecture

### Module layout

```
src/
  app/            # Next.js App Router shell
  components/     # Editor UI (React)
  hooks/          # useKeyboard, useTool, useAutosave, useCellMetrics, useClipboard
  store/          # Zustand store + undo/redo history
  model/          # Shape/Doc types, pure operations, ids
  renderer/       # Shape → CellPatch → composited 2D grid → text (pure, no DOM)
  templates/      # Shape factories with sensible defaults
  lib/            # clipboard, local-storage, png-export, tokens, keyboard
  tests/e2e/      # Playwright smoke
```

### Separation of concerns

- **Model** is pure data: shapes, docs, operations. No React, no DOM.
- **Renderer** is a pure function `render(doc) → string[][]` plus `toText(grid) → string`.
  Unit-testable without a browser.
- **Store** owns both undoable state (`doc`) and ephemeral UI state (active tool,
  hover, drafts, layout widths).
- **Components** subscribe to store slices and dispatch actions. No business logic.

### Data model

```ts
type ShapeId = string  // nanoid

interface ShapeBase {
  id: ShapeId
  type: string             // discriminator
  x: number; y: number     // top-left cell column/row
  w: number; h: number     // size in cells
  locked?: boolean
  hidden?: boolean
  name?: string            // user-visible label in layer panel
}

// Basic drawing shapes
interface RectangleShape extends ShapeBase { type: 'rectangle'; style: 'single'|'double'|'rounded'|'bold'|'ascii'; fill?: string }
interface EllipseShape   extends ShapeBase { type: 'ellipse' }
interface LineShape      extends ShapeBase { type: 'line'; style: 'single'|'double'|'ascii' }
interface ArrowShape     extends ShapeBase { type: 'arrow'; direction: 'up'|'down'|'left'|'right'; style: 'single'|'double'|'ascii'; head: 'single'|'double' }
interface TextShape      extends ShapeBase { type: 'text'; text: string; align: 'left'|'center'|'right'; wrap: boolean }

// Templates
interface ButtonShape            extends ShapeBase { type: 'button'; label: string; variant: 'square'|'rounded'|'double' }
interface ImagePlaceholderShape  extends ShapeBase { type: 'image-placeholder'; caption?: string }
interface TextFieldShape         extends ShapeBase { type: 'textfield'; label: string; placeholder: string; value: string }
interface TextAreaShape          extends ShapeBase { type: 'textarea'; label: string; value: string; rows: number }
interface MobileDeviceShape      extends ShapeBase { type: 'mobile-device'; device: 'iphone'|'android'; notch: boolean }
interface BrowserMockupShape     extends ShapeBase { type: 'browser'; url: string; title: string }
interface TabBarShape            extends ShapeBase { type: 'tab-bar'; tabs: string[]; active: number }
interface NavBarShape            extends ShapeBase { type: 'nav-bar'; title: string; leftIcon?: string; rightIcons: string[] }
interface MobileStatusBarShape   extends ShapeBase { type: 'status-bar'; time: string; battery: number; signal: number }
interface CheckboxShape          extends ShapeBase { type: 'checkbox'; label: string; checked: boolean }
interface IconPlaceholderShape   extends ShapeBase { type: 'icon'; glyph: string }
interface CardShape              extends ShapeBase { type: 'card'; title: string; body: string; divider: boolean }
interface ModalShape             extends ShapeBase { type: 'modal'; title: string; body: string; actions: string[] }

type Shape =
  | RectangleShape | EllipseShape | LineShape | ArrowShape | TextShape
  | ButtonShape | ImagePlaceholderShape | TextFieldShape | TextAreaShape
  | MobileDeviceShape | BrowserMockupShape | TabBarShape | NavBarShape
  | MobileStatusBarShape | CheckboxShape | IconPlaceholderShape
  | CardShape | ModalShape

interface Doc {
  id: string
  name: string
  gridW: number                   // default 80
  gridH: number                   // default 30
  shapes: Shape[]                 // bottom-to-top z-order; last = top
  selection: ShapeId[]
  schemaVersion: 1
  createdAt: number
  updatedAt: number
}
```

**Design notes:**
- Shapes carry only cell-coordinates — everything is integer, snap-to-grid by construction.
- Flat array + array order as z-order — reorder is array splice; no tree traversal in v1.
- Templates are first-class shape types, not macros over basic shapes. This keeps their
  rasterizers simple and their properties editable (e.g. a button is always a button,
  not a rectangle plus a text node).

### Rendering pipeline

1. For each shape in `doc.shapes` (bottom → top), run `rasterizeX(shape) → CellPatch`
   where `CellPatch = { x, y, w, h, cells: string[][] }`.
2. Apply the patch onto a `gridW × gridH` array of chars. Cells containing the sentinel
   `'\0'` are transparent and skip composition — this distinguishes intentional spaces
   from "see through" areas (hollow rectangle interiors).
3. Clip patches at the grid boundary. Off-canvas portions simply don't render.
4. `toText(grid)` joins rows with `\n`, right-trimming trailing whitespace per line.
5. PNG export: render the same grid onto an offscreen `<canvas>` using the same monospace
   font and background, then `canvas.toBlob()`.

The full grid is recomputed on every doc change (trivially fast at v1 scale —
~100 shapes × ~3000 cells). No memoization in v1.

### State, undo/redo

```ts
interface EditorState {
  doc: Doc                                 // undoable
  activeTool: ToolId                       // ephemeral
  hoveredShapeId: ShapeId | null
  draftShape: Shape | null                 // in-progress mousedown-drag shape
  isDragging: boolean
  inlineEditShapeId: ShapeId | null
  layout: { leftW: number; rightW: number }
  history: { past: Doc[]; future: Doc[] }

  applyDocChange: (fn: (d: Doc) => Doc, opts?: { skipHistory?: boolean }) => void
  undo: () => void
  redo: () => void
  setActiveTool: (t: ToolId) => void
  // ...
}
```

- Only `doc` is undoable. Selection is part of `doc` so users get their selection restored
  on undo — but selection-only changes are coalesced and don't push history on every click.
- History is a bounded ring buffer (100 entries) of immutable snapshots. Docs are small
  enough that a shallow clone per step is cheap.
- High-frequency edits (drag, resize, typing) are coalesced: changes during an active
  drag don't push history, and `pointerup` pushes a single entry with the pre-drag state.
  Typing coalesces within 500ms of the last keystroke.

### Persistence

- `ascii-mockups:doc:<id>` — one localStorage key per mockup
- `ascii-mockups:docs-index` — ordered list of `{id, name, updatedAt}` for the sidebar
- `ascii-mockups:current-doc-id` — last opened, restored on mount
- `ascii-mockups:layout` — `{ leftW, rightW }`
- `ascii-mockups:prefs` — `{ theme: 'light'|'dark' }`
- Autosave via `useAutosave` hook: debounced 800ms after doc change. Status indicator in
  the top bar ("Saved" / "Saving…").
- Every stored doc carries `schemaVersion`. Migrations run on load.

### Clipboard

Two clipboards, independently addressed:
1. **Shape clipboard** (in-memory, `Cmd+C/V` on selection) — serialized shapes, pastes
   at +1 cell offset. Works cross-document within the same session.
2. **ASCII clipboard** (OS clipboard via `navigator.clipboard.writeText`) — the "Copy
   ASCII" CTA writes the rendered grid as text. When a shape is selected, `Cmd+C` copies
   the shape; with no selection it falls back to the full ASCII.

## Features (v1 scope)

### Tools and templates

**Basic:** rectangle (5 styles), ellipse, line (3 styles), arrow (directional +
styles), text.

**Templates:** button (3 variants), image placeholder, text field, text area, mobile
device mockup (default 25×40), browser mockup (default 70×30), tab bar, navigation
bar, mobile status bar, checkbox, icon placeholder, card layout, modal dialog
(default 40×12).

All templates carry default sizes tuned for their shape. All text-bearing shapes
support inline double-click editing via an overlaid `<textarea>`.

### Editor features

- **Undo/redo** (`Cmd/Ctrl+Z`, `Cmd/Ctrl+Shift+Z`) — bounded history, drag coalescing
- **Copy / paste / duplicate** shapes (`Cmd/Ctrl+C/V/D`)
- **Keyboard nudging** — arrow keys move by 1 cell, `Shift+Arrow` by 10 cells
- **LocalStorage autosave** — 800ms debounce, status indicator
- **Named mockups** — create, rename, open, delete via the "Open" dropdown
- **Export**
  - Copy ASCII to clipboard (primary Terracotta CTA)
  - Download `.txt`
  - Export PNG (canvas screenshot using the same monospace font)
- **Configurable grid size** — width/height editable in a settings menu, defaulting to
  80×30. Growing the grid is free; shrinking clips shapes outside the new bounds
  (warn once).
- **Layer panel** — ordered list of shapes, drag to reorder (changes z-order), click to
  select, eye toggle for hide, padlock for lock (locked shapes ignore pointer events)
- **Snap-to-grid + alignment guides** — 1-cell snap is inherent; guides appear as thin
  Terracotta lines when a dragged shape aligns with another shape's edge or center
- **Multi-select** — shift-click to add, drag-rect on empty canvas to marquee-select,
  group-move/delete with a single undo entry
- **Light/dark theme toggle** — chrome only; the canvas stays monospace text but swaps
  its paper tile (Ivory → Dark Surface)
- **Resizable panes** — left and right panes have drag handles on their inner edges
  (180–480px range), widths persisted, double-click to reset, keyboard-accessible

### Keyboard shortcuts

| Key | Action |
|---|---|
| `V` | Select tool |
| `R`, `O`, `L`, `A`, `T`, `B` | Rectangle, Ellipse, Line, Arrow, Text, Button |
| `Delete` / `Backspace` | Delete selection |
| `Cmd/Ctrl+Z` / `+Shift+Z` | Undo / Redo |
| `Cmd/Ctrl+D` | Duplicate |
| `Cmd/Ctrl+C / V` | Copy / Paste shape (or full ASCII if no selection) |
| `Cmd/Ctrl+A` | Select all |
| Arrow keys | Nudge 1 cell |
| `Shift+Arrow` | Nudge 10 cells |
| `[` / `]` | Send backward / Bring forward |
| `Alt+[` / `Alt+]` | To back / To front |
| `Esc` | Cancel draft / Clear selection |
| `Enter` | Enter inline text edit |

## UI & Design

Applies the Claude design language from `DESIGN.md`:

- **Editor background:** Parchment `#f5f4ed`
- **Canvas surface tile:** Ivory `#faf9f5` with Border Cream `#f0eee6` ring, 32px radius —
  the "sheet of paper" where ASCII lives
- **Panels (tool palette, inspector, layer panel):** Ivory cards, ring shadows
  (`0px 0px 0px 1px`), 12px radius, no drop shadows
- **Primary CTAs** (Copy ASCII, New Mockup): Terracotta `#c96442`
- **Secondary buttons / tool buttons:** Warm Sand `#e8e6dc`, Charcoal Warm `#4d4c48`
  text, 8px radius
- **Active tool:** Terracotta ring; hovered shapes get a Warm Sand ring on canvas
- **Selection:** dashed Terracotta outline + 8 Terracotta resize handles
- **Typography:**
  - Wordmark and section headers: Anthropic Serif 500 (Georgia fallback)
  - All UI chrome text (buttons, labels, inspector fields): Anthropic Sans
    (system-ui/Arial fallback)
  - **The canvas itself:** Anthropic Mono (monospace stack fallback) — code-shaped content
- **Depth:** ring shadows everywhere, no drop shadows; the only whisper shadow
  (`rgba(0,0,0,0.05) 0px 4px 24px`) sits under the canvas tile to hint at page lift
- Dark theme swaps Parchment → Deep Dark `#141413` and Ivory → Dark Surface `#30302e`,
  keeping the warm palette

### Layout

Desktop ≥ 1200px: three resizable panes — Tool Palette (240px default), Canvas
(flex), Inspector + Layer Panel (280px default). Top bar spans full width with the
serif wordmark and file/export actions.

Tablet 992–1199px: same three panes, narrower defaults.

<992px: tool palette collapses into a horizontal bar above the canvas; inspector
becomes a slide-in panel toggled from the top bar.

<640px (mobile): editor becomes view/export-only; editing requires a larger pointer
and precise cell interaction that touch doesn't provide comfortably. Show a clear
message and offer desktop.

### Interaction model

- Active tool governs pointer behavior on the canvas (see keyboard shortcuts for tool
  letters).
- `select` tool: click selects, shift-click adds, drag on empty = marquee, drag on
  handle = resize, drag on body = move.
- Drawing tools: mousedown starts a new shape at the cell under the cursor; drag
  extends it; mouseup commits.
- Template tools: clicking the palette button places a pre-sized shape at canvas
  center, switches back to `select`.
- Double-click a text-bearing shape to enter inline text edit (overlaid `<textarea>`);
  commit on blur/Esc.

Cell-to-pixel conversion: measure character width/height once at mount via a hidden
`<span>`; floor-divide pointer delta to get cell coordinates. Snap-to-grid is
automatic because the canvas IS a grid.

## Testing

**Unit tests (Vitest), heavy coverage on pure modules:**
- `renderer/rasterize-*.test.ts` — one per shape type, snapshot-based
- `renderer/compose.test.ts` — z-order, clipping, transparency
- `renderer/text-layout.test.ts` — wrap, align, truncate
- `model/history.test.ts` — undo/redo invariants, coalescing, selection-only behavior
- `model/operations.test.ts` — move/resize/duplicate/reorder
- `templates/*.test.ts` — each template's default shape

Target: 80%+ coverage on `src/model`, `src/renderer`, `src/templates`.

**Integration tests (React Testing Library):**
- ToolPalette toggles active tool
- Canvas simulated pointer events add shapes to the doc
- Keyboard shortcuts dispatch expected actions
- Inspector edits flow back to the doc

**E2E (Playwright, one committed smoke test):**
- Draw a button, copy ASCII, verify clipboard content

**Playwright MCP during implementation:**
- After each feature slice, drive the running dev server with Playwright MCP to
  verify real behavior: click tools, draw shapes, copy output, diff against expected
  ASCII. Evidence over claims.

## Build & Deploy

- `bun install`
- `bun run dev` — Next.js dev server, HMR
- `bun run test` — Vitest watch
- `bun run test:e2e` — Playwright
- `bun run build` — production build; static-exportable
- `bun run lint`, `bun run typecheck` — ESLint + tsc

## Risks & Open Questions

- **Monospace font loading:** If the canvas font hasn't loaded when we measure cell
  size, cell coords will be wrong until the next measurement. Mitigation: block
  rendering on `document.fonts.ready`, re-measure on `resize` and theme change.
- **Clipboard API availability:** `navigator.clipboard.writeText` requires secure
  context (HTTPS or localhost). Fallback to a hidden `<textarea>` + `execCommand`
  still works for non-secure contexts (dev-only concern).
- **Unicode width:** All box-drawing glyphs used in v1 are single-width in common
  monospace fonts. We avoid emoji/wide glyphs in rasterizer output. If a user types
  wide characters into a Text shape, we render them as-is — they will break column
  alignment in downstream pastes. Acceptable for v1; document clearly.
- **Grid resize with out-of-bounds shapes:** Shrinking the grid below existing shapes
  clips them on paste but keeps them in the doc. Warn once, offer "trim out-of-bounds"
  action.

## Approved

User confirmed each section during brainstorming on 2026-04-22.
