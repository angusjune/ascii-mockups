# ASCII Mockups

A web-based ASCII-character mockup editor. Draw wireframes and UI mockups with box-drawing glyphs, then copy the ASCII anywhere plain text is accepted — READMEs, terminals, chat, design docs.

## Features

- **Basic drawing tools**: rectangle (5 styles), ellipse, line, arrow, text
- **Template shapes**: button, image placeholder, textfield, textarea, checkbox, icon, card, modal, mobile device mockup, browser mockup, tab bar, nav bar, mobile status bar
- **Editor**: object-mode shapes (select/move/resize/delete), 8-handle resize, keyboard nudge, snap-to-grid + alignment guides, multi-select
- **Undo/redo** with drag coalescing (100-entry history)
- **Persistence**: autosave to `localStorage`, multi-mockup open/new/rename/delete, resizable panes persisted across reloads
- **Export**: copy ASCII to clipboard, download as `.txt`, render to `.png`
- **Inline text edit** (double-click shape), shape clipboard (Cmd+C/V/D), select-all (Cmd+A)
- **Light/dark theme** — Claude-inspired Parchment + Terracotta palette
- **Resizable panes**: tool palette (left) and inspector/layer panel (right)

## Stack

- **Bun** — runtime + package manager
- **Next.js 16** + **React 19** + **TypeScript**
- **Zustand** — single store with undo/redo history and coalescing
- **Tailwind CSS v4** — design tokens keyed to the Claude system
- **Vitest** — unit tests (renderer is a pure `doc → grid → text` pipeline; 73+ tests)
- **Playwright** — E2E smoke ("draw a button and copy ASCII")

## Development

```bash
bun install
bun run dev        # Next.js dev server at http://localhost:3000
bun run test       # Vitest watch mode
bun run test:run   # Vitest one-shot
bun run test:e2e   # Playwright smoke
bun run build      # Production build (static-exportable)
bun run lint
bun run typecheck
```

## Architecture

- `src/model/` — pure Shape/Doc types and operations
- `src/renderer/` — pure `render(doc) → 2D char grid → string` pipeline, one rasterizer per shape type
- `src/templates/` — default-sized shape factories
- `src/store/` — Zustand store + immutable history
- `src/components/` — thin React views
- `src/hooks/` — `useTool`, `useKeyboard`, `useClipboard`, `useAutosave`, `useCellMetrics`
- `src/lib/` — localStorage, clipboard, PNG export, design tokens

Keyboard shortcuts: `V` select, `R` rectangle, `O` ellipse, `L` line, `A` arrow, `T` text, `B` button, `Cmd+Z` undo, `Cmd+Shift+Z` redo, `Cmd+D` duplicate, `Cmd+C/V` copy/paste shapes (or full ASCII if no selection), `Cmd+A` select all, arrows nudge 1 cell, `Shift+arrows` nudge 10 cells, `Delete` remove selection, `Esc` clear selection.
