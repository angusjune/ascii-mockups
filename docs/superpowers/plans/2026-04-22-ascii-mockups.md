# ASCII Mockups Builder Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a web-based ASCII mockup editor (grid-based canvas, object-mode shapes, rich template library, undo/redo, local persistence, multiple exports) per `docs/superpowers/specs/2026-04-22-ascii-mockups-design.md`.

**Architecture:** A single-page Next.js 16 client-rendered editor. Pure `model` + `renderer` modules (doc → 2D char grid → text). Zustand store holds undoable doc state and ephemeral UI state with a snapshot-based undo history. React components are thin; all behavior lives in tested, pure TypeScript.

**Tech Stack:** Bun, Next.js 16 (App Router), React 19, TypeScript, Zustand, Tailwind CSS v4, Vitest, React Testing Library, Playwright (+ Playwright MCP for per-step verification).

**Related:**
- Spec: `docs/superpowers/specs/2026-04-22-ascii-mockups-design.md`
- Design tokens: `DESIGN.md`

---

## File Map

### Scaffolding
- `package.json`, `bun.lock`, `tsconfig.json`, `next.config.ts`, `postcss.config.mjs`, `eslint.config.mjs`, `.gitignore`, `.prettierrc`
- `vitest.config.ts`, `playwright.config.ts`

### App shell
- `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

### Library (pure helpers)
- `src/lib/tokens.ts` — typed design tokens
- `src/lib/ids.ts` — nanoid wrapper
- `src/lib/clipboard.ts` — OS clipboard via `navigator.clipboard`
- `src/lib/local-storage.ts` — typed localStorage helpers
- `src/lib/png-export.ts` — render grid to canvas, blob download
- `src/lib/keyboard.ts` — key match helpers

### Model (pure data)
- `src/model/types.ts` — all shape + doc types
- `src/model/shape-ops.ts` — move, resize, duplicate, reorder
- `src/model/doc-ops.ts` — add/remove/update shape, selection

### Renderer (pure)
- `src/renderer/glyphs.ts`
- `src/renderer/text-layout.ts`
- `src/renderer/compose.ts`
- `src/renderer/index.ts` — `render(doc)`, `toText(grid)`
- `src/renderer/rasterize-<shape>.ts` — one per shape type (18 files)

### Templates
- `src/templates/index.ts` — `createTemplate(type) → Shape`

### Store
- `src/store/editor-store.ts` — Zustand store
- `src/store/history.ts` — undo/redo helpers

### Hooks
- `src/hooks/useCellMetrics.ts`
- `src/hooks/useTool.ts`
- `src/hooks/useKeyboard.ts`
- `src/hooks/useAutosave.ts`
- `src/hooks/useClipboard.ts`

### Components
- `src/components/Editor.tsx`
- `src/components/TopBar.tsx`
- `src/components/ToolPalette.tsx`
- `src/components/Canvas.tsx`
- `src/components/SelectionOverlay.tsx`
- `src/components/AlignmentGuides.tsx`
- `src/components/Inspector.tsx`
- `src/components/LayerPanel.tsx`
- `src/components/Resizer.tsx`
- `src/components/OpenDocDropdown.tsx`
- `src/components/ExportMenu.tsx`
- `src/components/SettingsMenu.tsx`
- `src/components/InlineTextEditor.tsx`
- `src/components/ThemeToggle.tsx`

### Tests
- Unit tests colocated: `<module>.test.ts` alongside source
- `tests/e2e/draw-and-copy.spec.ts` — committed Playwright smoke

---

## Phase 1 — Scaffolding

### Task 1: Initialize Next.js 16 + Bun + TypeScript

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.ts`, `.gitignore`, `eslint.config.mjs`, `.prettierrc`
- Create: `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/globals.css`

- [ ] **Step 1: Create package.json**

```json
{
  "name": "ascii-mockups",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit",
    "test": "vitest",
    "test:run": "vitest run",
    "test:e2e": "playwright test",
    "format": "prettier --write ."
  },
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^4.5.0",
    "nanoid": "^5.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "@types/node": "^22.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "typescript": "^5.6.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/postcss": "^4.0.0",
    "postcss": "^8.4.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^16.0.0",
    "prettier": "^3.3.0",
    "vitest": "^2.1.0",
    "@vitest/ui": "^2.1.0",
    "jsdom": "^25.0.0",
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.5.0",
    "@testing-library/user-event": "^14.5.0",
    "@playwright/test": "^1.48.0"
  }
}
```

- [ ] **Step 2: Create tsconfig.json**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./src/*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "playwright-report", "test-results"]
}
```

- [ ] **Step 3: Create next.config.ts**

```ts
import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactStrictMode: true,
  typedRoutes: true,
}

export default nextConfig
```

- [ ] **Step 4: Create .gitignore**

```
node_modules
.next
out
coverage
playwright-report
test-results
.vercel
.env*.local
.DS_Store
*.tsbuildinfo
next-env.d.ts
```

- [ ] **Step 5: Create eslint.config.mjs**

```js
import next from 'eslint-config-next'
export default [...next, { rules: { 'react/no-unescaped-entities': 'off' } }]
```

- [ ] **Step 6: Create .prettierrc**

```json
{ "semi": false, "singleQuote": true, "printWidth": 100, "trailingComma": "all" }
```

- [ ] **Step 7: Create src/app/layout.tsx**

```tsx
import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ASCII Mockups',
  description: 'Build ASCII-character mockups you can copy and paste anywhere.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-parchment text-near-black antialiased">{children}</body>
    </html>
  )
}
```

- [ ] **Step 8: Create src/app/page.tsx**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="font-serif text-5xl">ASCII Mockups</h1>
    </main>
  )
}
```

- [ ] **Step 9: Create src/app/globals.css (placeholder — tokens added in Task 3)**

```css
@import 'tailwindcss';

:root {
  --font-sans: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', 'Menlo', 'Consolas', 'DejaVu Sans Mono', monospace;
}

html, body { height: 100%; margin: 0; }
body { font-family: var(--font-sans); }
```

- [ ] **Step 10: Install and run**

```bash
bun install
bun run dev
```

Expected: dev server at `http://localhost:3000` shows "ASCII Mockups" heading.
Verify with Playwright MCP: navigate to `http://localhost:3000`, confirm heading text.

- [ ] **Step 11: Commit**

```bash
git add .
git commit -m "chore: scaffold Next.js 16 + Bun + TypeScript project"
```

---

### Task 2: Testing setup (Vitest + Playwright)

**Files:**
- Create: `vitest.config.ts`, `playwright.config.ts`, `src/test-setup.ts`, `postcss.config.mjs`
- Create: `tests/e2e/home.spec.ts` (placeholder smoke)

- [ ] **Step 1: Create postcss.config.mjs**

```js
export default { plugins: { '@tailwindcss/postcss': {} } }
```

- [ ] **Step 2: Create vitest.config.ts**

```ts
import { defineConfig } from 'vitest/config'
import path from 'node:path'

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    globals: true,
    coverage: {
      include: ['src/model/**', 'src/renderer/**', 'src/templates/**'],
      thresholds: { lines: 80, statements: 80, branches: 75, functions: 80 },
    },
  },
  resolve: { alias: { '@': path.resolve(__dirname, './src') } },
})
```

- [ ] **Step 3: Create src/test-setup.ts**

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 4: Create playwright.config.ts**

```ts
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  use: { baseURL: 'http://localhost:3000', trace: 'retain-on-failure' },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: 'bun run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
})
```

- [ ] **Step 5: Create a throwaway smoke test to verify both test runners**

`src/model/smoke.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
describe('vitest bootstrap', () => {
  it('runs', () => { expect(1 + 1).toBe(2) })
})
```

`tests/e2e/home.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('loads home page', async ({ page }) => {
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'ASCII Mockups' })).toBeVisible()
})
```

- [ ] **Step 6: Run both test runners**

```bash
bun run test:run
bun x playwright install chromium
bun run test:e2e
```

Expected: both green.

- [ ] **Step 7: Delete the throwaway vitest smoke**

```bash
rm src/model/smoke.test.ts
```

Keep the Playwright home smoke — we'll expand it later.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "chore: configure vitest and playwright"
```

---

### Task 3: Design tokens + fonts

**Files:**
- Create: `src/lib/tokens.ts`
- Modify: `src/app/globals.css`, `src/app/layout.tsx`

- [ ] **Step 1: Create src/lib/tokens.ts**

```ts
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
```

- [ ] **Step 2: Replace src/app/globals.css**

```css
@import 'tailwindcss';

@theme {
  --color-parchment: #f5f4ed;
  --color-ivory: #faf9f5;
  --color-pure-white: #ffffff;
  --color-warm-sand: #e8e6dc;
  --color-border-cream: #f0eee6;
  --color-border-warm: #e8e6dc;
  --color-ring-warm: #d1cfc5;
  --color-ring-deep: #c2c0b6;
  --color-terracotta: #c96442;
  --color-coral: #d97757;
  --color-error-crimson: #b53333;
  --color-focus-blue: #3898ec;
  --color-near-black: #141413;
  --color-dark-surface: #30302e;
  --color-border-dark: #30302e;
  --color-charcoal-warm: #4d4c48;
  --color-olive-gray: #5e5d59;
  --color-stone-gray: #87867f;
  --color-dark-warm: #3d3d3a;
  --color-warm-silver: #b0aea5;

  --font-sans: system-ui, -apple-system, 'Segoe UI', Arial, sans-serif;
  --font-serif: Georgia, 'Times New Roman', serif;
  --font-mono: 'SF Mono', 'Menlo', 'Consolas', 'DejaVu Sans Mono', monospace;

  --radius-sharp: 4px;
  --radius-subtle: 6px;
  --radius-comfy: 8px;
  --radius-generous: 12px;
  --radius-featured: 16px;
  --radius-tag: 24px;
  --radius-hero: 32px;
}

html, body { height: 100%; margin: 0; }
body {
  font-family: var(--font-sans);
  background: var(--color-parchment);
  color: var(--color-near-black);
}

[data-theme='dark'] body {
  background: var(--color-near-black);
  color: var(--color-warm-silver);
}

.font-serif { font-family: var(--font-serif); }
.font-mono  { font-family: var(--font-mono); }

/* Ring-shadow pattern used by panels and buttons */
.ring-warm { box-shadow: 0 0 0 1px var(--color-ring-warm); }
.ring-deep { box-shadow: 0 0 0 1px var(--color-ring-deep); }
.ring-border-warm { box-shadow: 0 0 0 1px var(--color-border-warm); }

/* Whisper shadow for the canvas tile lift */
.shadow-whisper { box-shadow: 0 4px 24px rgba(0, 0, 0, 0.05); }
```

- [ ] **Step 3: Update page.tsx to preview tokens**

```tsx
export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6">
      <h1 className="font-serif text-5xl text-near-black">ASCII Mockups</h1>
      <div className="rounded-[12px] bg-ivory px-6 py-3 ring-border-warm">
        <span className="font-mono text-charcoal-warm">the quick brown fox ┌─┐</span>
      </div>
      <button className="rounded-[8px] bg-terracotta px-4 py-2 text-ivory ring-1 ring-terracotta">
        Copy ASCII
      </button>
    </main>
  )
}
```

- [ ] **Step 4: Verify visually**

Run `bun run dev`. Open `http://localhost:3000` via Playwright MCP. Take a screenshot. Confirm Parchment background, Ivory card with monospace, Terracotta button. If colors don't render, check Tailwind v4 PostCSS config.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat: add Claude design tokens and base styles"
```

---

## Phase 2 — Model

### Task 4: Shape and Doc types

**Files:**
- Create: `src/model/types.ts`, `src/lib/ids.ts`

- [ ] **Step 1: Create src/lib/ids.ts**

```ts
import { nanoid } from 'nanoid'

export function newId(): string {
  return nanoid(10)
}
```

- [ ] **Step 2: Create src/model/types.ts**

```ts
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
  // Avoid importing nanoid into types to keep it type-only for consumers
  return Math.random().toString(36).slice(2, 12)
}
```

- [ ] **Step 3: Write smoke test for emptyDoc**

`src/model/types.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { emptyDoc } from './types'

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
```

- [ ] **Step 4: Run tests**

```bash
bun run test:run src/model/types.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(model): define shape and doc types"
```

---

### Task 5: Shape and Doc operations

**Files:**
- Create: `src/model/shape-ops.ts`, `src/model/shape-ops.test.ts`
- Create: `src/model/doc-ops.ts`, `src/model/doc-ops.test.ts`

- [ ] **Step 1: Write shape-ops tests first**

`src/model/shape-ops.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { move, resize, duplicateShape } from './shape-ops'
import type { RectangleShape } from './types'

const rect: RectangleShape = {
  id: 'a', type: 'rectangle', x: 5, y: 5, w: 10, h: 4, style: 'single',
}

describe('move', () => {
  it('returns a new object with dx/dy applied', () => {
    const moved = move(rect, 2, -1)
    expect(moved).not.toBe(rect)
    expect(moved.x).toBe(7)
    expect(moved.y).toBe(4)
    expect(rect.x).toBe(5) // original unchanged
  })
})

describe('resize', () => {
  it('applies size deltas, enforcing min size 1', () => {
    expect(resize(rect, { dw: -20, dh: 0 }).w).toBe(1)
    expect(resize(rect, { dw: 0, dh: -20 }).h).toBe(1)
    expect(resize(rect, { dw: 3, dh: 2 })).toMatchObject({ w: 13, h: 6 })
  })
})

describe('duplicateShape', () => {
  it('returns a clone with new id offset by +1 in x/y', () => {
    const dup = duplicateShape(rect)
    expect(dup.id).not.toBe(rect.id)
    expect(dup.x).toBe(rect.x + 1)
    expect(dup.y).toBe(rect.y + 1)
    expect(dup.type).toBe(rect.type)
  })
})
```

- [ ] **Step 2: Run — expect failure**

```bash
bun run test:run src/model/shape-ops.test.ts
```

Expected: FAIL ("Cannot find module './shape-ops'").

- [ ] **Step 3: Implement src/model/shape-ops.ts**

```ts
import { newId } from '@/lib/ids'
import type { Shape } from './types'

export function move<S extends Shape>(shape: S, dx: number, dy: number): S {
  return { ...shape, x: shape.x + dx, y: shape.y + dy }
}

export function resize<S extends Shape>(shape: S, delta: { dw: number; dh: number }): S {
  return {
    ...shape,
    w: Math.max(1, shape.w + delta.dw),
    h: Math.max(1, shape.h + delta.dh),
  }
}

export function duplicateShape<S extends Shape>(shape: S): S {
  return { ...shape, id: newId(), x: shape.x + 1, y: shape.y + 1 }
}
```

- [ ] **Step 4: Run — expect pass**

```bash
bun run test:run src/model/shape-ops.test.ts
```

Expected: PASS.

- [ ] **Step 5: Write doc-ops tests**

`src/model/doc-ops.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { emptyDoc } from './types'
import {
  addShape, removeShapes, updateShape, setSelection,
  bringForward, sendBackward, toFront, toBack,
} from './doc-ops'
import type { RectangleShape } from './types'

const mkRect = (id: string, x = 0): RectangleShape => ({
  id, type: 'rectangle', x, y: 0, w: 5, h: 3, style: 'single',
})

describe('addShape', () => {
  it('appends shape and updates updatedAt', () => {
    const before = emptyDoc()
    const after = addShape(before, mkRect('a'))
    expect(after.shapes.map(s => s.id)).toEqual(['a'])
    expect(after.updatedAt).toBeGreaterThanOrEqual(before.updatedAt)
    expect(after).not.toBe(before)
  })
})

describe('removeShapes', () => {
  it('removes by id and clears from selection', () => {
    const doc = setSelection(addShape(addShape(emptyDoc(), mkRect('a')), mkRect('b')), ['a','b'])
    const result = removeShapes(doc, ['a'])
    expect(result.shapes.map(s => s.id)).toEqual(['b'])
    expect(result.selection).toEqual(['b'])
  })
})

describe('updateShape', () => {
  it('merges patch into the shape by id', () => {
    const doc = addShape(emptyDoc(), mkRect('a'))
    const result = updateShape(doc, 'a', { x: 10 } as Partial<RectangleShape>)
    expect(result.shapes[0].x).toBe(10)
  })
  it('no-ops if id not found', () => {
    const doc = addShape(emptyDoc(), mkRect('a'))
    const result = updateShape(doc, 'missing', { x: 10 } as Partial<RectangleShape>)
    expect(result.shapes[0].x).toBe(0)
  })
})

describe('z-order helpers', () => {
  const base = addShape(addShape(addShape(emptyDoc(), mkRect('a')), mkRect('b')), mkRect('c'))
  it('bringForward swaps with next neighbor', () => {
    expect(bringForward(base, 'a').shapes.map(s => s.id)).toEqual(['b','a','c'])
  })
  it('bringForward on topmost is no-op', () => {
    expect(bringForward(base, 'c').shapes.map(s => s.id)).toEqual(['a','b','c'])
  })
  it('sendBackward swaps with prev neighbor', () => {
    expect(sendBackward(base, 'c').shapes.map(s => s.id)).toEqual(['a','c','b'])
  })
  it('toFront moves to end', () => {
    expect(toFront(base, 'a').shapes.map(s => s.id)).toEqual(['b','c','a'])
  })
  it('toBack moves to start', () => {
    expect(toBack(base, 'c').shapes.map(s => s.id)).toEqual(['c','a','b'])
  })
})
```

- [ ] **Step 6: Implement src/model/doc-ops.ts**

```ts
import type { Doc, Shape, ShapeId } from './types'

function touched(doc: Doc, patch: Partial<Doc>): Doc {
  return { ...doc, ...patch, updatedAt: Date.now() }
}

export function addShape(doc: Doc, shape: Shape): Doc {
  return touched(doc, { shapes: [...doc.shapes, shape] })
}

export function removeShapes(doc: Doc, ids: ShapeId[]): Doc {
  const set = new Set(ids)
  return touched(doc, {
    shapes: doc.shapes.filter(s => !set.has(s.id)),
    selection: doc.selection.filter(id => !set.has(id)),
  })
}

export function updateShape<S extends Shape>(doc: Doc, id: ShapeId, patch: Partial<S>): Doc {
  let changed = false
  const shapes = doc.shapes.map(s => {
    if (s.id !== id) return s
    changed = true
    return { ...s, ...patch } as Shape
  })
  if (!changed) return doc
  return touched(doc, { shapes })
}

export function setSelection(doc: Doc, ids: ShapeId[]): Doc {
  return { ...doc, selection: ids }
}

function moveInArray<T>(arr: T[], fromIdx: number, toIdx: number): T[] {
  if (fromIdx === toIdx || fromIdx < 0 || fromIdx >= arr.length) return arr
  const copy = arr.slice()
  const [item] = copy.splice(fromIdx, 1)
  copy.splice(toIdx, 0, item)
  return copy
}

export function bringForward(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0 || i === doc.shapes.length - 1) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, i + 1) })
}

export function sendBackward(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i <= 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, i - 1) })
}

export function toFront(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, doc.shapes.length - 1) })
}

export function toBack(doc: Doc, id: ShapeId): Doc {
  const i = doc.shapes.findIndex(s => s.id === id)
  if (i < 0) return doc
  return touched(doc, { shapes: moveInArray(doc.shapes, i, 0) })
}
```

- [ ] **Step 7: Run both test files**

```bash
bun run test:run src/model
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git add .
git commit -m "feat(model): add shape and doc operations"
```

---

## Phase 3 — Renderer foundations

### Task 6: Glyph sets + text-layout helper

**Files:**
- Create: `src/renderer/glyphs.ts`, `src/renderer/text-layout.ts`, `src/renderer/text-layout.test.ts`

- [ ] **Step 1: Create src/renderer/glyphs.ts**

```ts
export const BOX = {
  single:  { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  double:  { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  bold:    { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
  ascii:   { tl: '+', tr: '+', bl: '+', br: '+', h: '-', v: '|' },
} as const

export type BoxStyle = keyof typeof BOX

export const LINE = {
  single: { h: '─', v: '│', diagUp: '╱', diagDown: '╲' },
  double: { h: '═', v: '║', diagUp: '╱', diagDown: '╲' },
  ascii:  { h: '-', v: '|', diagUp: '/', diagDown: '\\' },
} as const
export type LineStyle = keyof typeof LINE

export const ARROW_HEADS = {
  single: { up: '↑', down: '↓', left: '←', right: '→' },
  double: { up: '⇑', down: '⇓', left: '⇐', right: '⇒' },
  ascii:  { up: '^', down: 'v', left: '<', right: '>' },
} as const

export const TRANSPARENT = '\0'
```

- [ ] **Step 2: Write text-layout tests**

`src/renderer/text-layout.test.ts`:
```ts
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
```

- [ ] **Step 3: Run — expect failure**

```bash
bun run test:run src/renderer/text-layout.test.ts
```

Expected: FAIL.

- [ ] **Step 4: Implement src/renderer/text-layout.ts**

```ts
export function wrapText(text: string, width: number): string[] {
  if (width <= 0) return ['']
  const paragraphs = text.split('\n')
  const out: string[] = []
  for (const p of paragraphs) {
    if (p.length === 0) { out.push(''); continue }
    const words = p.split(' ')
    let line = ''
    for (const w of words) {
      if (w.length > width) {
        if (line) { out.push(line); line = '' }
        for (let i = 0; i < w.length; i += width) out.push(w.slice(i, i + width))
        line = out.pop() ?? ''
        if (line.length === width) { out.push(line); line = '' }
        continue
      }
      const next = line.length === 0 ? w : line + ' ' + w
      if (next.length <= width) line = next
      else { out.push(line); line = w }
    }
    if (line) out.push(line)
  }
  return out
}

export function alignLine(
  line: string, width: number, align: 'left' | 'center' | 'right',
): string {
  if (line.length >= width) return line.slice(0, width)
  const pad = width - line.length
  if (align === 'left') return line + ' '.repeat(pad)
  if (align === 'right') return ' '.repeat(pad) + line
  const left = Math.floor(pad / 2)
  const right = pad - left
  return ' '.repeat(left) + line + ' '.repeat(right)
}

export interface LayoutOpts {
  text: string
  w: number
  h: number
  align: 'left' | 'center' | 'right'
  wrap: boolean
}

export function layoutText(opts: LayoutOpts): string[][] {
  const { text, w, h, align, wrap } = opts
  const rawLines = wrap ? wrapText(text, w) : text.split('\n')
  const rows: string[][] = []
  for (let i = 0; i < h; i++) {
    const line = rawLines[i] ?? ''
    rows.push(alignLine(line, w, align).split(''))
  }
  return rows
}
```

- [ ] **Step 5: Run — expect pass**

```bash
bun run test:run src/renderer/text-layout.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add .
git commit -m "feat(renderer): add glyph sets and text-layout helper"
```

---

### Task 7: Compose (z-order, clipping, transparency)

**Files:**
- Create: `src/renderer/compose.ts`, `src/renderer/compose.test.ts`

- [ ] **Step 1: Write tests**

`src/renderer/compose.test.ts`:
```ts
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
})
```

- [ ] **Step 2: Run — expect failure**

```bash
bun run test:run src/renderer/compose.test.ts
```

- [ ] **Step 3: Implement src/renderer/compose.ts**

```ts
import { TRANSPARENT } from './glyphs'

export type Grid = string[][]

export interface CellPatch {
  x: number
  y: number
  w: number
  h: number
  cells: string[][]
}

export function emptyGrid(w: number, h: number): Grid {
  const g: Grid = []
  for (let y = 0; y < h; y++) {
    const row: string[] = new Array(w)
    for (let x = 0; x < w; x++) row[x] = ' '
    g.push(row)
  }
  return g
}

export function applyPatch(grid: Grid, patch: CellPatch): void {
  const gh = grid.length
  const gw = gh === 0 ? 0 : grid[0].length
  for (let dy = 0; dy < patch.h; dy++) {
    const gy = patch.y + dy
    if (gy < 0 || gy >= gh) continue
    const row = patch.cells[dy]
    if (!row) continue
    for (let dx = 0; dx < patch.w; dx++) {
      const gx = patch.x + dx
      if (gx < 0 || gx >= gw) continue
      const ch = row[dx]
      if (ch === undefined || ch === TRANSPARENT) continue
      grid[gy][gx] = ch
    }
  }
}

export function gridToString(grid: Grid): string {
  return grid.map(row => row.join('').replace(/\s+$/u, '')).join('\n')
}
```

- [ ] **Step 4: Run — expect pass**

```bash
bun run test:run src/renderer/compose.test.ts
```

- [ ] **Step 5: Commit**

```bash
git add .
git commit -m "feat(renderer): compose with z-order clipping and transparency"
```

---

### Task 8: render() entry point + toText()

**Files:**
- Create: `src/renderer/index.ts`, `src/renderer/index.test.ts`

- [ ] **Step 1: Write tests (covering the empty-doc case and registry dispatch)**

`src/renderer/index.test.ts`:
```ts
import { describe, it, expect } from 'vitest'
import { render, toText } from './index'
import { emptyDoc } from '@/model/types'

describe('render', () => {
  it('returns a grid of the doc size for an empty doc', () => {
    const d = emptyDoc()
    const g = render(d)
    expect(g.length).toBe(d.gridH)
    expect(g[0].length).toBe(d.gridW)
    expect(toText(g)).toBe(''.padEnd(0) + '\n'.repeat(d.gridH - 1))
  })

  it('skips hidden shapes', () => {
    const d = emptyDoc()
    const doc = { ...d, shapes: [{ id:'1', type:'rectangle', x:0, y:0, w:3, h:3, style:'single', hidden: true } as any] }
    expect(toText(render(doc))).toBe(''.padEnd(0) + '\n'.repeat(d.gridH - 1))
  })
})
```

- [ ] **Step 2: Create src/renderer/index.ts**

```ts
import type { Doc, Shape } from '@/model/types'
import { emptyGrid, applyPatch, gridToString, type CellPatch, type Grid } from './compose'

type Rasterizer<S extends Shape = Shape> = (shape: S) => CellPatch

const registry = new Map<Shape['type'], Rasterizer>()

export function registerRasterizer<T extends Shape['type']>(
  type: T, fn: Rasterizer<Extract<Shape, { type: T }>>,
): void {
  registry.set(type, fn as Rasterizer)
}

export function render(doc: Doc): Grid {
  const grid = emptyGrid(doc.gridW, doc.gridH)
  for (const shape of doc.shapes) {
    if (shape.hidden) continue
    const fn = registry.get(shape.type)
    if (!fn) continue
    applyPatch(grid, fn(shape))
  }
  return grid
}

export function toText(grid: Grid): string {
  return gridToString(grid)
}

export type { Grid, CellPatch }
```

- [ ] **Step 3: Run — expect pass (for the empty-doc path; unknown types are skipped)**

```bash
bun run test:run src/renderer/index.test.ts
```

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat(renderer): add render() entry point with type registry"
```

---

## Phase 4 — Basic shape rasterizers

> Pattern for every rasterizer task: write test with expected `CellPatch.cells` as a 2D array (readable in-line), implement, register in `index.ts`, commit.

### Task 9: Rectangle rasterizer

**Files:**
- Create: `src/renderer/rasterize-rectangle.ts`, `src/renderer/rasterize-rectangle.test.ts`
- Modify: `src/renderer/index.ts` (register)

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeRectangle } from './rasterize-rectangle'
import { TRANSPARENT } from './glyphs'
import type { RectangleShape } from '@/model/types'

const T = TRANSPARENT

describe('rasterizeRectangle', () => {
  it('renders single-style borders with transparent interior', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:1, y:1, w:4, h:3, style:'single' }
    const patch = rasterizeRectangle(shape)
    expect(patch).toEqual({
      x: 1, y: 1, w: 4, h: 3,
      cells: [
        ['┌','─','─','┐'],
        ['│', T , T ,'│'],
        ['└','─','─','┘'],
      ],
    })
  })

  it('renders 1xN as a vertical line', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:1, h:3, style:'single' }
    expect(rasterizeRectangle(shape).cells).toEqual([['│'],['│'],['│']])
  })

  it('renders Nx1 as a horizontal line', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:1, style:'single' }
    expect(rasterizeRectangle(shape).cells).toEqual([['─','─','─']])
  })

  it('fills interior when fill is provided', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:3, style:'ascii', fill:'.' }
    expect(rasterizeRectangle(shape).cells[1]).toEqual(['|','.','|'])
  })

  it('uses the requested style glyphs', () => {
    const shape: RectangleShape = { id:'r', type:'rectangle', x:0, y:0, w:3, h:3, style:'rounded' }
    expect(rasterizeRectangle(shape).cells[0]).toEqual(['╭','─','╮'])
  })
})
```

- [ ] **Step 2: Run — expect fail**

- [ ] **Step 3: Implement**

```ts
import type { RectangleShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX, TRANSPARENT } from './glyphs'

export function rasterizeRectangle(shape: RectangleShape): CellPatch {
  const { x, y, w, h, style, fill } = shape
  const g = BOX[style]
  if (w === 1 && h === 1) return { x, y, w, h, cells: [[g.tl]] }
  if (w === 1) {
    const cells: string[][] = []
    for (let i = 0; i < h; i++) cells.push([g.v])
    return { x, y, w, h, cells }
  }
  if (h === 1) {
    const row = new Array(w).fill(g.h)
    return { x, y, w, h, cells: [row] }
  }
  const cells: string[][] = []
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w)
    for (let c = 0; c < w; c++) {
      const isTop = r === 0, isBottom = r === h - 1
      const isLeft = c === 0, isRight = c === w - 1
      if (isTop && isLeft) row[c] = g.tl
      else if (isTop && isRight) row[c] = g.tr
      else if (isBottom && isLeft) row[c] = g.bl
      else if (isBottom && isRight) row[c] = g.br
      else if (isTop || isBottom) row[c] = g.h
      else if (isLeft || isRight) row[c] = g.v
      else row[c] = fill ?? TRANSPARENT
    }
    cells.push(row)
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 4: Register and run tests**

In `src/renderer/index.ts`, add at the bottom:

```ts
import { rasterizeRectangle } from './rasterize-rectangle'
registerRasterizer('rectangle', rasterizeRectangle)
```

Run `bun run test:run src/renderer`. Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(renderer): rasterize rectangle"
```

---

### Task 10: Text rasterizer

**Files:**
- Create: `src/renderer/rasterize-text.ts`, `src/renderer/rasterize-text.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeText } from './rasterize-text'
import type { TextShape } from '@/model/types'

describe('rasterizeText', () => {
  it('renders left-aligned text row', () => {
    const s: TextShape = { id:'t', type:'text', x:0, y:0, w:5, h:1, text:'hi', align:'left', wrap:false }
    expect(rasterizeText(s).cells).toEqual([['h','i',' ',' ',' ']])
  })
  it('wraps when wrap=true', () => {
    const s: TextShape = { id:'t', type:'text', x:0, y:0, w:3, h:2, text:'ab cd ef', align:'left', wrap:true }
    expect(rasterizeText(s).cells).toEqual([['a','b',' '],['c','d',' ']])
  })
  it('honors center align', () => {
    const s: TextShape = { id:'t', type:'text', x:0, y:0, w:5, h:1, text:'hi', align:'center', wrap:false }
    expect(rasterizeText(s).cells).toEqual([[' ','h','i',' ',' ']])
  })
})
```

- [ ] **Step 2: Implement**

```ts
import type { TextShape } from '@/model/types'
import type { CellPatch } from './compose'
import { layoutText } from './text-layout'

export function rasterizeText(shape: TextShape): CellPatch {
  const cells = layoutText({
    text: shape.text, w: shape.w, h: shape.h, align: shape.align, wrap: shape.wrap,
  })
  return { x: shape.x, y: shape.y, w: shape.w, h: shape.h, cells }
}
```

- [ ] **Step 3: Register and test**

```ts
// index.ts
import { rasterizeText } from './rasterize-text'
registerRasterizer('text', rasterizeText)
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat(renderer): rasterize text"
```

---

### Task 11: Line rasterizer

**Files:**
- Create: `src/renderer/rasterize-line.ts`, `src/renderer/rasterize-line.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeLine } from './rasterize-line'
import type { LineShape } from '@/model/types'

describe('rasterizeLine', () => {
  it('draws horizontal line when h=1', () => {
    const s: LineShape = { id:'l', type:'line', x:0, y:0, w:4, h:1, style:'single' }
    expect(rasterizeLine(s).cells).toEqual([['─','─','─','─']])
  })
  it('draws vertical line when w=1', () => {
    const s: LineShape = { id:'l', type:'line', x:0, y:0, w:1, h:3, style:'single' }
    expect(rasterizeLine(s).cells).toEqual([['│'],['│'],['│']])
  })
  it('draws top-left → bottom-right diagonal when wider than 1', () => {
    const s: LineShape = { id:'l', type:'line', x:0, y:0, w:3, h:3, style:'single' }
    const cells = rasterizeLine(s).cells
    expect(cells[0][0]).toBe('╲')
    expect(cells[1][1]).toBe('╲')
    expect(cells[2][2]).toBe('╲')
  })
  it('uses ascii glyphs when style=ascii', () => {
    const s: LineShape = { id:'l', type:'line', x:0, y:0, w:3, h:1, style:'ascii' }
    expect(rasterizeLine(s).cells).toEqual([['-','-','-']])
  })
})
```

- [ ] **Step 2: Implement**

```ts
import type { LineShape } from '@/model/types'
import type { CellPatch } from './compose'
import { LINE, TRANSPARENT } from './glyphs'

export function rasterizeLine(shape: LineShape): CellPatch {
  const { x, y, w, h, style } = shape
  const g = LINE[style]
  const cells: string[][] = []
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w).fill(TRANSPARENT)
    cells.push(row)
  }
  if (h === 1) { for (let c = 0; c < w; c++) cells[0][c] = g.h; return { x, y, w, h, cells } }
  if (w === 1) { for (let r = 0; r < h; r++) cells[r][0] = g.v; return { x, y, w, h, cells } }
  // diagonal: map each row to proportional column
  const steps = Math.max(w, h)
  for (let i = 0; i < steps; i++) {
    const cx = Math.round((i / (steps - 1)) * (w - 1))
    const cy = Math.round((i / (steps - 1)) * (h - 1))
    cells[cy][cx] = g.diagDown
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Register, test, commit**

```ts
import { rasterizeLine } from './rasterize-line'
registerRasterizer('line', rasterizeLine)
```

```bash
git commit -am "feat(renderer): rasterize line"
```

---

### Task 12: Arrow rasterizer

**Files:**
- Create: `src/renderer/rasterize-arrow.ts`, `src/renderer/rasterize-arrow.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeArrow } from './rasterize-arrow'
import type { ArrowShape } from '@/model/types'

describe('rasterizeArrow', () => {
  it('draws a right-pointing arrow on a single row', () => {
    const s: ArrowShape = { id:'a', type:'arrow', x:0, y:0, w:5, h:1, direction:'right', style:'single', head:'single' }
    expect(rasterizeArrow(s).cells).toEqual([['─','─','─','─','→']])
  })
  it('draws a left-pointing arrow with head at start', () => {
    const s: ArrowShape = { id:'a', type:'arrow', x:0, y:0, w:4, h:1, direction:'left', style:'single', head:'single' }
    expect(rasterizeArrow(s).cells).toEqual([['←','─','─','─']])
  })
  it('draws a down arrow in a single column', () => {
    const s: ArrowShape = { id:'a', type:'arrow', x:0, y:0, w:1, h:3, direction:'down', style:'single', head:'single' }
    expect(rasterizeArrow(s).cells).toEqual([['│'],['│'],['↓']])
  })
  it('uses ascii glyphs', () => {
    const s: ArrowShape = { id:'a', type:'arrow', x:0, y:0, w:4, h:1, direction:'right', style:'ascii', head:'single' }
    expect(rasterizeArrow(s).cells).toEqual([['-','-','-','>']])
  })
})
```

- [ ] **Step 2: Implement**

```ts
import type { ArrowShape } from '@/model/types'
import type { CellPatch } from './compose'
import { LINE, ARROW_HEADS, TRANSPARENT } from './glyphs'

export function rasterizeArrow(shape: ArrowShape): CellPatch {
  const { x, y, w, h, style, direction, head } = shape
  const g = LINE[style]
  const headChar = ARROW_HEADS[head][direction]
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(TRANSPARENT))

  const horizontal = direction === 'left' || direction === 'right'
  if (horizontal) {
    const row = Math.floor(h / 2)
    for (let c = 0; c < w; c++) cells[row][c] = g.h
    if (direction === 'right') cells[row][w - 1] = headChar
    else cells[row][0] = headChar
  } else {
    const col = Math.floor(w / 2)
    for (let r = 0; r < h; r++) cells[r][col] = g.v
    if (direction === 'down') cells[h - 1][col] = headChar
    else cells[0][col] = headChar
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Register, test, commit**

```ts
import { rasterizeArrow } from './rasterize-arrow'
registerRasterizer('arrow', rasterizeArrow)
```

```bash
git commit -am "feat(renderer): rasterize arrow"
```

---

### Task 13: Ellipse rasterizer

**Files:**
- Create: `src/renderer/rasterize-ellipse.ts`, `src/renderer/rasterize-ellipse.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeEllipse } from './rasterize-ellipse'
import type { EllipseShape } from '@/model/types'

describe('rasterizeEllipse', () => {
  it('renders a small ellipse with rounded corners and curved sides', () => {
    const s: EllipseShape = { id:'e', type:'ellipse', x:0, y:0, w:6, h:3 }
    const cells = rasterizeEllipse(s).cells
    expect(cells[0][0]).toBe('╭')
    expect(cells[0][5]).toBe('╮')
    expect(cells[2][0]).toBe('╰')
    expect(cells[2][5]).toBe('╯')
    expect(cells[1][0]).toBe('(')
    expect(cells[1][5]).toBe(')')
  })
  it('is 1x1 safe (single dot)', () => {
    const s: EllipseShape = { id:'e', type:'ellipse', x:0, y:0, w:1, h:1 }
    expect(rasterizeEllipse(s).cells).toEqual([['o']])
  })
})
```

- [ ] **Step 2: Implement**

```ts
import type { EllipseShape } from '@/model/types'
import type { CellPatch } from './compose'
import { TRANSPARENT } from './glyphs'

export function rasterizeEllipse(shape: EllipseShape): CellPatch {
  const { x, y, w, h } = shape
  const cells: string[][] = []
  if (w === 1 && h === 1) return { x, y, w, h, cells: [['o']] }
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w).fill(TRANSPARENT)
    cells.push(row)
  }
  const top = 0, bot = h - 1, left = 0, right = w - 1
  // Corners (rounded)
  cells[top][left] = '╭'
  cells[top][right] = '╮'
  cells[bot][left] = '╰'
  cells[bot][right] = '╯'
  // Top and bottom edges
  for (let c = left + 1; c < right; c++) {
    cells[top][c] = '─'
    cells[bot][c] = '─'
  }
  // Left and right side use curved parens to suggest the bulge
  for (let r = top + 1; r < bot; r++) {
    cells[r][left] = '('
    cells[r][right] = ')'
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Register, test, commit**

```ts
import { rasterizeEllipse } from './rasterize-ellipse'
registerRasterizer('ellipse', rasterizeEllipse)
```

```bash
git commit -am "feat(renderer): rasterize ellipse"
```

---

## Phase 5 — Template rasterizers

> Each template rasterizer composes its characters directly into a `CellPatch`. When a template has an outer frame, we reuse `rasterizeRectangle` with an appropriate style, then overwrite specific cells for headers/captions.

### Task 14: Button rasterizer

**Files:**
- Create: `src/renderer/rasterize-button.ts`, `src/renderer/rasterize-button.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeButton } from './rasterize-button'
import type { ButtonShape } from '@/model/types'

describe('rasterizeButton', () => {
  it('renders a square single-line button', () => {
    const s: ButtonShape = { id:'b', type:'button', x:0, y:0, w:10, h:1, label:'OK', variant:'square' }
    const cells = rasterizeButton(s).cells
    expect(cells[0].join('')).toBe('[   OK   ]')
  })
  it('renders a rounded single-line button', () => {
    const s: ButtonShape = { id:'b', type:'button', x:0, y:0, w:10, h:1, label:'OK', variant:'rounded' }
    expect(rasterizeButton(s).cells[0].join('')).toBe('(   OK   )')
  })
  it('renders a multi-line framed button', () => {
    const s: ButtonShape = { id:'b', type:'button', x:0, y:0, w:10, h:3, label:'Save', variant:'square' }
    const lines = rasterizeButton(s).cells.map(r => r.join(''))
    expect(lines[0]).toBe('┌────────┐')
    expect(lines[1]).toBe('│  Save  │')
    expect(lines[2]).toBe('└────────┘')
  })
})
```

- [ ] **Step 2: Implement**

```ts
import type { ButtonShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeButton(shape: ButtonShape): CellPatch {
  const { x, y, w, h, label, variant } = shape
  if (h === 1) {
    const open = variant === 'rounded' ? '(' : variant === 'double' ? '«' : '['
    const close = variant === 'rounded' ? ')' : variant === 'double' ? '»' : ']'
    const inner = alignLine(label, Math.max(0, w - 2), 'center')
    const row = (open + inner + close).split('').slice(0, w)
    while (row.length < w) row.push(' ')
    return { x, y, w, h, cells: [row] }
  }
  const style = variant === 'double' ? 'double' : variant === 'rounded' ? 'rounded' : 'single'
  const g = BOX[style]
  const cells: string[][] = []
  const midRow = Math.floor(h / 2)
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w)
    for (let c = 0; c < w; c++) {
      const isTop = r === 0, isBot = r === h - 1
      const isLeft = c === 0, isRight = c === w - 1
      if (isTop && isLeft) row[c] = g.tl
      else if (isTop && isRight) row[c] = g.tr
      else if (isBot && isLeft) row[c] = g.bl
      else if (isBot && isRight) row[c] = g.br
      else if (isTop || isBot) row[c] = g.h
      else if (isLeft || isRight) row[c] = g.v
      else row[c] = ' '
    }
    cells.push(row)
  }
  const inner = alignLine(label, Math.max(0, w - 2), 'center')
  for (let c = 1; c < w - 1; c++) cells[midRow][c] = inner[c - 1] ?? ' '
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Register, test, commit**

```ts
import { rasterizeButton } from './rasterize-button'
registerRasterizer('button', rasterizeButton)
```

```bash
git commit -am "feat(renderer): rasterize button"
```

---

### Task 15: Checkbox + Icon rasterizers

**Files:**
- Create: `src/renderer/rasterize-checkbox.ts`, `rasterize-checkbox.test.ts`
- Create: `src/renderer/rasterize-icon.ts`, `rasterize-icon.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Checkbox test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeCheckbox } from './rasterize-checkbox'
import type { CheckboxShape } from '@/model/types'

describe('rasterizeCheckbox', () => {
  it('renders unchecked box with label', () => {
    const s: CheckboxShape = { id:'c', type:'checkbox', x:0, y:0, w:12, h:1, label:'Subscribe', checked:false }
    expect(rasterizeCheckbox(s).cells[0].join('')).toBe('[ ] Subscribe')
      .toString && (expect(rasterizeCheckbox(s).cells[0].join('').slice(0, 12)).toBe('[ ] Subscrib'))
  })
  it('renders checked box', () => {
    const s: CheckboxShape = { id:'c', type:'checkbox', x:0, y:0, w:5, h:1, label:'Ok', checked:true }
    expect(rasterizeCheckbox(s).cells[0].join('')).toBe('[x] O')
  })
})
```

- [ ] **Step 2: Checkbox implementation**

```ts
import type { CheckboxShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeCheckbox(shape: CheckboxShape): CellPatch {
  const { x, y, w, h, label, checked } = shape
  const prefix = checked ? '[x] ' : '[ ] '
  const text = alignLine(prefix + label, w, 'left')
  const cells: string[][] = [text.split('')]
  for (let r = 1; r < h; r++) cells.push(alignLine('', w, 'left').split(''))
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Icon test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeIcon } from './rasterize-icon'
import type { IconPlaceholderShape } from '@/model/types'

describe('rasterizeIcon', () => {
  it('wraps glyph in brackets', () => {
    const s: IconPlaceholderShape = { id:'i', type:'icon', x:0, y:0, w:3, h:1, glyph:'★' }
    expect(rasterizeIcon(s).cells[0]).toEqual(['[','★',']'])
  })
  it('pads to width', () => {
    const s: IconPlaceholderShape = { id:'i', type:'icon', x:0, y:0, w:5, h:1, glyph:'?' }
    expect(rasterizeIcon(s).cells[0].join('')).toBe('[ ? ]')
  })
})
```

- [ ] **Step 4: Icon implementation**

```ts
import type { IconPlaceholderShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeIcon(shape: IconPlaceholderShape): CellPatch {
  const { x, y, w, h, glyph } = shape
  const inner = alignLine(glyph, Math.max(0, w - 2), 'center')
  const row = ('[' + inner + ']').split('').slice(0, w)
  while (row.length < w) row.push(' ')
  const cells: string[][] = [row]
  for (let r = 1; r < h; r++) cells.push(alignLine('', w, 'left').split(''))
  return { x, y, w, h, cells }
}
```

- [ ] **Step 5: Register, run tests, commit**

```ts
import { rasterizeCheckbox } from './rasterize-checkbox'
import { rasterizeIcon } from './rasterize-icon'
registerRasterizer('checkbox', rasterizeCheckbox)
registerRasterizer('icon', rasterizeIcon)
```

```bash
git commit -am "feat(renderer): rasterize checkbox and icon placeholder"
```

---

### Task 16: Image placeholder + TextField + TextArea

**Files:**
- Create: `rasterize-image-placeholder.ts`/`.test.ts`, `rasterize-textfield.ts`/`.test.ts`, `rasterize-textarea.ts`/`.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Image placeholder**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeImagePlaceholder } from './rasterize-image-placeholder'
import type { ImagePlaceholderShape } from '@/model/types'

describe('rasterizeImagePlaceholder', () => {
  it('renders box with diagonal X inside', () => {
    const s: ImagePlaceholderShape = { id:'i', type:'image-placeholder', x:0, y:0, w:5, h:3 }
    const c = rasterizeImagePlaceholder(s).cells.map(r => r.join(''))
    expect(c[0]).toBe('┌───┐')
    expect(c[1][0]).toBe('│')
    expect(c[1][c[1].length - 1]).toBe('│')
    expect(c[1].includes('╳') || c[1].includes('╲') || c[1].includes('╱')).toBe(true)
    expect(c[2]).toBe('└───┘')
  })
})
```

Implementation:
```ts
import type { ImagePlaceholderShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeImagePlaceholder(shape: ImagePlaceholderShape): CellPatch {
  const { x, y, w, h, caption } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) {
    const row: string[] = new Array(w)
    for (let c = 0; c < w; c++) {
      const isTop = r === 0, isBot = r === h - 1
      const isLeft = c === 0, isRight = c === w - 1
      if (isTop && isLeft) row[c] = g.tl
      else if (isTop && isRight) row[c] = g.tr
      else if (isBot && isLeft) row[c] = g.bl
      else if (isBot && isRight) row[c] = g.br
      else if (isTop || isBot) row[c] = g.h
      else if (isLeft || isRight) row[c] = g.v
      else row[c] = ' '
    }
    cells.push(row)
  }
  // Diagonals inside the frame (from TL→BR and TR→BL)
  const innerLeft = 1, innerRight = w - 2, innerTop = 1, innerBot = h - 2
  const iw = innerRight - innerLeft + 1, ih = innerBot - innerTop + 1
  if (iw > 0 && ih > 0) {
    const steps = Math.max(iw, ih)
    for (let i = 0; i < steps; i++) {
      const t = steps === 1 ? 0 : i / (steps - 1)
      const cx1 = innerLeft + Math.round(t * (iw - 1))
      const cy1 = innerTop + Math.round(t * (ih - 1))
      const cx2 = innerRight - Math.round(t * (iw - 1))
      const cy2 = innerTop + Math.round(t * (ih - 1))
      if (cells[cy1][cx1] === ' ') cells[cy1][cx1] = '╲'
      if (cells[cy2][cx2] === ' ') cells[cy2][cx2] = cells[cy2][cx2] === '╲' ? '╳' : '╱'
    }
  }
  if (caption && h >= 3) {
    const row = alignLine(caption.slice(0, w - 2), w - 2, 'center').split('')
    for (let c = 0; c < row.length; c++) cells[h - 2][innerLeft + c] = row[c]
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 2: Register + smoke test**

```ts
import { rasterizeImagePlaceholder } from './rasterize-image-placeholder'
registerRasterizer('image-placeholder', rasterizeImagePlaceholder)
```

- [ ] **Step 3: TextField**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeTextField } from './rasterize-textfield'
import type { TextFieldShape } from '@/model/types'

describe('rasterizeTextField', () => {
  it('renders label, box, and value', () => {
    const s: TextFieldShape = { id:'t', type:'textfield', x:0, y:0, w:12, h:3, label:'Email', placeholder:'', value:'x@y' }
    const c = rasterizeTextField(s).cells.map(r => r.join(''))
    expect(c[0].startsWith('Email')).toBe(true)
    expect(c[1].startsWith('┌')).toBe(true)
    expect(c[1].includes('x@y')).toBe(true)
    expect(c[1].endsWith('┐')).toBe(true)
    expect(c[2].startsWith('└')).toBe(true)
  })
  it('shows placeholder when value is empty', () => {
    const s: TextFieldShape = { id:'t', type:'textfield', x:0, y:0, w:14, h:3, label:'', placeholder:'search', value:'' }
    const c = rasterizeTextField(s).cells.map(r => r.join(''))
    expect(c[0].includes('search')).toBe(true)
  })
})
```

Implementation:
```ts
import type { TextFieldShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine } from './text-layout'

export function rasterizeTextField(shape: TextFieldShape): CellPatch {
  const { x, y, w, h, label, placeholder, value } = shape
  const cells: string[][] = []
  const g = BOX.single
  const labelRow = label.length > 0 ? 1 : 0
  const boxTop = labelRow
  const boxBot = h - 1
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  if (label.length > 0) {
    const row = alignLine(label, w, 'left').split('')
    for (let c = 0; c < w; c++) cells[0][c] = row[c]
  }
  // top border
  cells[boxTop][0] = g.tl
  for (let c = 1; c < w - 1; c++) cells[boxTop][c] = g.h
  cells[boxTop][w - 1] = g.tr
  // content row
  const contentRow = boxTop + 1
  if (contentRow < boxBot) {
    cells[contentRow][0] = g.v
    cells[contentRow][w - 1] = g.v
    const text = value.length > 0 ? value : placeholder
    const inner = alignLine(' ' + text, Math.max(0, w - 2), 'left').split('')
    for (let c = 1; c < w - 1; c++) cells[contentRow][c] = inner[c - 1] ?? ' '
  }
  // fill middle empty rows
  for (let r = boxTop + 1; r < boxBot; r++) {
    if (r === contentRow) continue
    cells[r][0] = g.v
    cells[r][w - 1] = g.v
  }
  // bottom border
  cells[boxBot][0] = g.bl
  for (let c = 1; c < w - 1; c++) cells[boxBot][c] = g.h
  cells[boxBot][w - 1] = g.br
  return { x, y, w, h, cells }
}
```

- [ ] **Step 4: TextArea**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeTextArea } from './rasterize-textarea'
import type { TextAreaShape } from '@/model/types'

describe('rasterizeTextArea', () => {
  it('renders multi-line box with wrapped value', () => {
    const s: TextAreaShape = { id:'t', type:'textarea', x:0, y:0, w:10, h:5, label:'Notes', value:'one two three', rows:3 }
    const c = rasterizeTextArea(s).cells.map(r => r.join(''))
    expect(c[0].startsWith('Notes')).toBe(true)
    expect(c[1].startsWith('┌')).toBe(true)
    expect(c[c.length - 1].startsWith('└')).toBe(true)
  })
})
```

Implementation:
```ts
import type { TextAreaShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { alignLine, layoutText } from './text-layout'

export function rasterizeTextArea(shape: TextAreaShape): CellPatch {
  const { x, y, w, h, label, value } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  const boxTop = label.length > 0 ? 1 : 0
  const boxBot = h - 1
  if (label.length > 0) {
    const row = alignLine(label, w, 'left').split('')
    for (let c = 0; c < w; c++) cells[0][c] = row[c]
  }
  cells[boxTop][0] = g.tl; cells[boxTop][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[boxTop][c] = g.h
  cells[boxBot][0] = g.bl; cells[boxBot][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[boxBot][c] = g.h
  const innerW = Math.max(0, w - 4), innerH = Math.max(0, boxBot - boxTop - 1)
  const content = layoutText({ text: value, w: innerW, h: innerH, align: 'left', wrap: true })
  for (let r = 0; r < innerH; r++) {
    const gy = boxTop + 1 + r
    cells[gy][0] = g.v; cells[gy][w - 1] = g.v
    for (let c = 0; c < innerW; c++) cells[gy][2 + c] = content[r][c]
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 5: Register, run tests, commit**

```ts
import { rasterizeTextField } from './rasterize-textfield'
import { rasterizeTextArea } from './rasterize-textarea'
registerRasterizer('textfield', rasterizeTextField)
registerRasterizer('textarea', rasterizeTextArea)
```

```bash
git commit -am "feat(renderer): rasterize image placeholder, textfield, textarea"
```

---

### Task 17: Card + Modal rasterizers

**Files:**
- Create: `rasterize-card.ts`/`.test.ts`, `rasterize-modal.ts`/`.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Card test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeCard } from './rasterize-card'
import type { CardShape } from '@/model/types'

describe('rasterizeCard', () => {
  it('renders title in top border and body text inside', () => {
    const s: CardShape = { id:'c', type:'card', x:0, y:0, w:14, h:5, title:'Title', body:'hello', divider:true }
    const lines = rasterizeCard(s).cells.map(r => r.join(''))
    expect(lines[0].startsWith('┌─ Title ')).toBe(true)
    expect(lines[0].endsWith('┐')).toBe(true)
    expect(lines[2].includes('hello')).toBe(true)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
```

- [ ] **Step 2: Card implementation**

```ts
import type { CardShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { layoutText } from './text-layout'

export function rasterizeCard(shape: CardShape): CellPatch {
  const { x, y, w, h, title, body, divider } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  // Top border with title: ┌─ Title ──────┐
  cells[0][0] = g.tl
  const titleText = title.length > 0 ? ` ${title} ` : ''
  const start = 2
  const maxTitleLen = Math.max(0, w - 4)
  const clipped = titleText.slice(0, maxTitleLen)
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  for (let i = 0; i < clipped.length; i++) cells[0][start + i] = clipped[i]
  cells[0][w - 1] = g.tr
  // Body
  const contentTop = divider && h >= 4 ? 2 : 1
  if (divider && h >= 4) {
    cells[1][0] = g.v; cells[1][w - 1] = g.v
  }
  const innerW = Math.max(0, w - 4)
  const innerH = Math.max(0, h - 1 - contentTop)
  const bodyCells = layoutText({ text: body, w: innerW, h: innerH, align: 'left', wrap: true })
  for (let r = 0; r < innerH; r++) {
    const gy = contentTop + r
    cells[gy][0] = g.v; cells[gy][w - 1] = g.v
    for (let c = 0; c < innerW; c++) cells[gy][2 + c] = bodyCells[r][c]
  }
  // Bottom border
  cells[h - 1][0] = g.bl
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  cells[h - 1][w - 1] = g.br
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Modal test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeModal } from './rasterize-modal'
import type { ModalShape } from '@/model/types'

describe('rasterizeModal', () => {
  it('renders title border, body, and right-aligned action buttons', () => {
    const s: ModalShape = { id:'m', type:'modal', x:0, y:0, w:30, h:6, title:'Confirm', body:'Sure?', actions:['Cancel','OK'] }
    const lines = rasterizeModal(s).cells.map(r => r.join(''))
    expect(lines[0]).toMatch(/^┌─ Confirm /)
    expect(lines[lines.length - 2]).toMatch(/\[Cancel\]/)
    expect(lines[lines.length - 2]).toMatch(/\[OK\]/)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
```

- [ ] **Step 4: Modal implementation**

```ts
import type { ModalShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'
import { layoutText } from './text-layout'

export function rasterizeModal(shape: ModalShape): CellPatch {
  const { x, y, w, h, title, body, actions } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))

  cells[0][0] = g.tl; cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  const titleText = title.length > 0 ? ` ${title} ` : ''
  for (let i = 0; i < Math.min(titleText.length, w - 4); i++) cells[0][2 + i] = titleText[i]

  cells[h - 1][0] = g.bl; cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h

  for (let r = 1; r < h - 1; r++) { cells[r][0] = g.v; cells[r][w - 1] = g.v }

  const actionRow = h - 2
  const bodyH = actionRow - 1
  const innerW = Math.max(0, w - 4)
  const bodyCells = layoutText({ text: body, w: innerW, h: bodyH, align: 'left', wrap: true })
  for (let r = 0; r < bodyH; r++) {
    for (let c = 0; c < innerW; c++) cells[1 + r][2 + c] = bodyCells[r][c]
  }
  const buttons = actions.map(a => `[${a}]`).join(' ')
  const start = Math.max(2, w - 2 - buttons.length)
  for (let i = 0; i < buttons.length && start + i < w - 1; i++) cells[actionRow][start + i] = buttons[i]
  return { x, y, w, h, cells }
}
```

- [ ] **Step 5: Register + commit**

```ts
import { rasterizeCard } from './rasterize-card'
import { rasterizeModal } from './rasterize-modal'
registerRasterizer('card', rasterizeCard)
registerRasterizer('modal', rasterizeModal)
```

```bash
git commit -am "feat(renderer): rasterize card and modal"
```

---

### Task 18: Status bar, Nav bar, Tab bar

**Files:**
- Create: `rasterize-statusbar.ts`/`.test.ts`, `rasterize-navbar.ts`/`.test.ts`, `rasterize-tabbar.ts`/`.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Status bar**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeStatusBar } from './rasterize-statusbar'
import type { MobileStatusBarShape } from '@/model/types'

describe('rasterizeStatusBar', () => {
  it('shows time on left and battery on right', () => {
    const s: MobileStatusBarShape = { id:'s', type:'status-bar', x:0, y:0, w:30, h:1, time:'9:41', battery:100, signal:4 }
    const line = rasterizeStatusBar(s).cells[0].join('')
    expect(line.startsWith(' 9:41')).toBe(true)
    expect(line.trimEnd().endsWith('100%')).toBe(true)
    expect(line.includes('●')).toBe(true)
  })
})
```

Implementation:
```ts
import type { MobileStatusBarShape } from '@/model/types'
import type { CellPatch } from './compose'

export function rasterizeStatusBar(shape: MobileStatusBarShape): CellPatch {
  const { x, y, w, h, time, battery, signal } = shape
  const left = ` ${time}`
  const sig = '●'.repeat(Math.max(0, Math.min(5, signal))) + '○'.repeat(Math.max(0, 5 - signal))
  const right = `${sig} ${battery}% `
  const middle = ' '.repeat(Math.max(0, w - left.length - right.length))
  const line = (left + middle + right).slice(0, w).padEnd(w, ' ')
  const cells: string[][] = [line.split('')]
  for (let r = 1; r < h; r++) cells.push(new Array(w).fill(' '))
  return { x, y, w, h, cells }
}
```

- [ ] **Step 2: Nav bar**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeNavBar } from './rasterize-navbar'
import type { NavBarShape } from '@/model/types'

describe('rasterizeNavBar', () => {
  it('renders box with title and right icons', () => {
    const s: NavBarShape = { id:'n', type:'nav-bar', x:0, y:0, w:30, h:3, title:'Home', leftIcon:'☰', rightIcons:['⚙','⋮'] }
    const lines = rasterizeNavBar(s).cells.map(r => r.join(''))
    expect(lines[0].startsWith('┌')).toBe(true)
    expect(lines[1].includes('Home')).toBe(true)
    expect(lines[1].includes('☰')).toBe(true)
    expect(lines[1].includes('⚙')).toBe(true)
    expect(lines[2].startsWith('└')).toBe(true)
  })
})
```

Implementation:
```ts
import type { NavBarShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeNavBar(shape: NavBarShape): CellPatch {
  const { x, y, w, h, title, leftIcon, rightIcons } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  cells[0][0] = g.tl; cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  cells[h - 1][0] = g.bl; cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  for (let r = 1; r < h - 1; r++) { cells[r][0] = g.v; cells[r][w - 1] = g.v }
  const midRow = Math.floor(h / 2)
  if (leftIcon) cells[midRow][2] = leftIcon
  const titleStart = leftIcon ? 4 : 2
  for (let i = 0; i < title.length && titleStart + i < w - 2; i++) cells[midRow][titleStart + i] = title[i]
  const icons = rightIcons.join(' ')
  const start = Math.max(titleStart + title.length + 1, w - 2 - icons.length)
  for (let i = 0; i < icons.length && start + i < w - 1; i++) cells[midRow][start + i] = icons[i]
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Tab bar**

Test:
```ts
import { describe, it, expect } from 'vitest'
import { rasterizeTabBar } from './rasterize-tabbar'
import type { TabBarShape } from '@/model/types'

describe('rasterizeTabBar', () => {
  it('divides row into equal cells with labels', () => {
    const s: TabBarShape = { id:'t', type:'tab-bar', x:0, y:0, w:24, h:3, tabs:['Home','Feed','Me'], active:1 }
    const lines = rasterizeTabBar(s).cells.map(r => r.join(''))
    expect(lines[0].startsWith('├')).toBe(true)
    expect(lines[1].includes('Home')).toBe(true)
    expect(lines[1].includes('Feed')).toBe(true)
    expect(lines[1].includes('Me')).toBe(true)
    expect(lines[2].startsWith('└')).toBe(true)
  })
})
```

Implementation:
```ts
import type { TabBarShape } from '@/model/types'
import type { CellPatch } from './compose'
import { alignLine } from './text-layout'

export function rasterizeTabBar(shape: TabBarShape): CellPatch {
  const { x, y, w, h, tabs, active } = shape
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  const n = Math.max(1, tabs.length)
  const cellW = Math.floor((w - 1) / n)
  const dividers = [0]
  for (let i = 1; i < n; i++) dividers.push(i * cellW)
  dividers.push(w - 1)
  // Top edge with tees
  cells[0][0] = '├'
  for (let c = 1; c < w - 1; c++) cells[0][c] = '─'
  cells[0][w - 1] = '┤'
  for (let i = 1; i < dividers.length - 1; i++) cells[0][dividers[i]] = '┬'
  // Label row
  const midRow = Math.floor(h / 2)
  for (let i = 0; i < n; i++) {
    const leftEdge = dividers[i]
    const rightEdge = dividers[i + 1]
    cells[midRow][leftEdge] = '│'
    cells[midRow][rightEdge] = '│'
    const innerW = Math.max(0, rightEdge - leftEdge - 1)
    const isActive = i === active
    const label = isActive ? '*' + tabs[i] + '*' : tabs[i]
    const text = alignLine(label, innerW, 'center').split('')
    for (let c = 0; c < innerW; c++) cells[midRow][leftEdge + 1 + c] = text[c]
  }
  // Bottom edge
  cells[h - 1][0] = '└'
  cells[h - 1][w - 1] = '┘'
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = '─'
  for (let i = 1; i < dividers.length - 1; i++) cells[h - 1][dividers[i]] = '┴'
  return { x, y, w, h, cells }
}
```

- [ ] **Step 4: Register + commit**

```ts
import { rasterizeStatusBar } from './rasterize-statusbar'
import { rasterizeNavBar } from './rasterize-navbar'
import { rasterizeTabBar } from './rasterize-tabbar'
registerRasterizer('status-bar', rasterizeStatusBar)
registerRasterizer('nav-bar', rasterizeNavBar)
registerRasterizer('tab-bar', rasterizeTabBar)
```

```bash
git commit -am "feat(renderer): rasterize status bar, nav bar, tab bar"
```

---

### Task 19: Mobile device + Browser mockup

**Files:**
- Create: `rasterize-mobile-device.ts`/`.test.ts`, `rasterize-browser.ts`/`.test.ts`
- Modify: `src/renderer/index.ts`

- [ ] **Step 1: Mobile device test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeMobileDevice } from './rasterize-mobile-device'
import type { MobileDeviceShape } from '@/model/types'

describe('rasterizeMobileDevice', () => {
  it('renders rounded phone outline with status-bar slot', () => {
    const s: MobileDeviceShape = { id:'m', type:'mobile-device', x:0, y:0, w:10, h:6, device:'iphone', notch:true }
    const lines = rasterizeMobileDevice(s).cells.map(r => r.join(''))
    expect(lines[0][0]).toBe('╭')
    expect(lines[0][lines[0].length - 1]).toBe('╮')
    expect(lines[lines.length - 1][0]).toBe('╰')
    expect(lines[1].includes('●')).toBe(true) // status decorations
  })
})
```

Implementation:
```ts
import type { MobileDeviceShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeMobileDevice(shape: MobileDeviceShape): CellPatch {
  const { x, y, w, h, notch } = shape
  const g = BOX.rounded
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  cells[0][0] = g.tl; cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  cells[h - 1][0] = g.bl; cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  for (let r = 1; r < h - 1; r++) { cells[r][0] = g.v; cells[r][w - 1] = g.v }
  // status bar inside frame (row 1)
  if (h >= 4) {
    const statusRow = 1
    const left = ' ●●●'
    const right = notch ? '▂▂▂▂ ' : '100% '
    for (let i = 0; i < left.length && i < w - 2; i++) cells[statusRow][1 + i] = left[i]
    for (let i = 0; i < right.length && i < w - 2; i++) {
      const pos = w - 1 - right.length + i
      if (pos > 0 && pos < w - 1) cells[statusRow][pos] = right[i]
    }
    // divider below status bar
    const divRow = 2
    cells[divRow][0] = '├'
    cells[divRow][w - 1] = '┤'
    for (let c = 1; c < w - 1; c++) cells[divRow][c] = '─'
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 2: Browser mockup test**

```ts
import { describe, it, expect } from 'vitest'
import { rasterizeBrowser } from './rasterize-browser'
import type { BrowserMockupShape } from '@/model/types'

describe('rasterizeBrowser', () => {
  it('renders window chrome, traffic lights, and url bar', () => {
    const s: BrowserMockupShape = { id:'b', type:'browser', x:0, y:0, w:30, h:6, url:'https://example.com', title:'Example' }
    const lines = rasterizeBrowser(s).cells.map(r => r.join(''))
    expect(lines[0].startsWith('┌')).toBe(true)
    expect(lines[1].includes('●')).toBe(true)
    expect(lines[1].includes('example.com')).toBe(true)
    expect(lines[2].startsWith('├')).toBe(true)
    expect(lines[lines.length - 1].startsWith('└')).toBe(true)
  })
})
```

Implementation:
```ts
import type { BrowserMockupShape } from '@/model/types'
import type { CellPatch } from './compose'
import { BOX } from './glyphs'

export function rasterizeBrowser(shape: BrowserMockupShape): CellPatch {
  const { x, y, w, h, url } = shape
  const g = BOX.single
  const cells: string[][] = []
  for (let r = 0; r < h; r++) cells.push(new Array(w).fill(' '))
  cells[0][0] = g.tl; cells[0][w - 1] = g.tr
  for (let c = 1; c < w - 1; c++) cells[0][c] = g.h
  cells[h - 1][0] = g.bl; cells[h - 1][w - 1] = g.br
  for (let c = 1; c < w - 1; c++) cells[h - 1][c] = g.h
  for (let r = 1; r < h - 1; r++) { cells[r][0] = g.v; cells[r][w - 1] = g.v }
  if (h >= 4) {
    const chromeRow = 1
    const left = ' ● ● ●   '
    for (let i = 0; i < left.length && i < w - 2; i++) cells[chromeRow][1 + i] = left[i]
    const urlText = `[ ${url} ]`
    const start = Math.max(left.length + 1, 1)
    const maxLen = Math.max(0, w - 2 - start)
    const shown = urlText.slice(0, maxLen)
    for (let i = 0; i < shown.length; i++) cells[chromeRow][start + i] = shown[i]
    // divider
    cells[2][0] = '├'
    cells[2][w - 1] = '┤'
    for (let c = 1; c < w - 1; c++) cells[2][c] = '─'
  }
  return { x, y, w, h, cells }
}
```

- [ ] **Step 3: Register + commit**

```ts
import { rasterizeMobileDevice } from './rasterize-mobile-device'
import { rasterizeBrowser } from './rasterize-browser'
registerRasterizer('mobile-device', rasterizeMobileDevice)
registerRasterizer('browser', rasterizeBrowser)
```

```bash
git commit -am "feat(renderer): rasterize mobile device and browser mockup"
```

---

### Task 20: Template factories

**Files:**
- Create: `src/templates/index.ts`, `src/templates/index.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect } from 'vitest'
import { createTemplate } from './index'

describe('createTemplate', () => {
  it('mobile-device gets 25x40 default', () => {
    const s = createTemplate('mobile-device', 0, 0)
    expect(s).toMatchObject({ type:'mobile-device', w: 25, h: 40 })
  })
  it('browser gets 70x30 default', () => {
    expect(createTemplate('browser', 0, 0)).toMatchObject({ type:'browser', w: 70, h: 30 })
  })
  it('button gets label "Button"', () => {
    expect(createTemplate('button', 0, 0)).toMatchObject({ type:'button', label: 'Button' })
  })
  it('text gets placeholder text', () => {
    expect(createTemplate('text', 0, 0)).toMatchObject({ type:'text', text: 'Text' })
  })
  it('assigns a unique id to each', () => {
    const a = createTemplate('rectangle', 0, 0)
    const b = createTemplate('rectangle', 0, 0)
    expect(a.id).not.toBe(b.id)
  })
})
```

- [ ] **Step 2: Implementation**

```ts
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
      return { ...base, type, w: 28, h: 3, tabs: ['Home','Feed','New','Me'], active: 0 }
    case 'nav-bar':
      return { ...base, type, w: 32, h: 3, title: 'Title', leftIcon: '☰', rightIcons: ['⚙','⋮'] }
    case 'status-bar':
      return { ...base, type, w: 25, h: 1, time: '9:41', battery: 100, signal: 4 }
    case 'checkbox':
      return { ...base, type, w: 18, h: 1, label: 'Subscribe', checked: false }
    case 'icon':
      return { ...base, type, w: 3, h: 1, glyph: '★' }
    case 'card':
      return { ...base, type, w: 30, h: 10, title: 'Card', body: 'Body text here.', divider: true }
    case 'modal':
      return { ...base, type, w: 40, h: 12, title: 'Are you sure?', body: 'This cannot be undone.', actions: ['Cancel','OK'] }
  }
}
```

- [ ] **Step 3: Run tests + commit**

```bash
bun run test:run src/templates
git commit -am "feat(templates): add template factories with defaults"
```

---

## Phase 6 — Store & history

### Task 21: Zustand store + basic actions

**Files:**
- Install: zustand (already in deps)
- Create: `src/store/editor-store.ts`, `src/store/editor-store.test.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useEditor } from './editor-store'

describe('editor store', () => {
  beforeEach(() => { useEditor.getState().resetForTest() })

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
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'Renamed' }))
    expect(useEditor.getState().doc.name).toBe('Renamed')
  })

  it('adds a shape via helper and records selection', () => {
    const shape = { id: 's1', type: 'rectangle', x: 0, y: 0, w: 3, h: 3, style: 'single' } as const
    useEditor.getState().addShapeAndSelect(shape)
    expect(useEditor.getState().doc.shapes.map(s => s.id)).toEqual(['s1'])
    expect(useEditor.getState().doc.selection).toEqual(['s1'])
  })
})
```

- [ ] **Step 2: Implementation**

```ts
import { create } from 'zustand'
import type { Doc, Shape, ShapeId, ToolId } from '@/model/types'
import { emptyDoc } from '@/model/types'
import { addShape, setSelection } from '@/model/doc-ops'

export interface EditorState {
  doc: Doc
  activeTool: ToolId
  hoveredShapeId: ShapeId | null
  draftShape: Shape | null
  isDragging: boolean
  inlineEditShapeId: ShapeId | null
  layout: { leftW: number; rightW: number }

  setActiveTool: (t: ToolId) => void
  setHovered: (id: ShapeId | null) => void
  setDraft: (s: Shape | null) => void
  setInlineEdit: (id: ShapeId | null) => void
  setLayout: (patch: Partial<{ leftW: number; rightW: number }>) => void

  applyDocChange: (fn: (d: Doc) => Doc, opts?: { skipHistory?: boolean }) => void
  addShapeAndSelect: (shape: Shape) => void
  replaceDoc: (d: Doc) => void
  resetForTest: () => void
}

const DEFAULT_LAYOUT = { leftW: 240, rightW: 280 }

export const useEditor = create<EditorState>((set, get) => ({
  doc: emptyDoc(),
  activeTool: 'select',
  hoveredShapeId: null,
  draftShape: null,
  isDragging: false,
  inlineEditShapeId: null,
  layout: DEFAULT_LAYOUT,

  setActiveTool: (t) => set({ activeTool: t }),
  setHovered: (id) => set({ hoveredShapeId: id }),
  setDraft: (s) => set({ draftShape: s }),
  setInlineEdit: (id) => set({ inlineEditShapeId: id }),
  setLayout: (patch) => set(s => ({ layout: { ...s.layout, ...patch } })),

  applyDocChange: (fn) => set(s => ({ doc: fn(s.doc) })),
  addShapeAndSelect: (shape) => set(s => {
    const next = setSelection(addShape(s.doc, shape), [shape.id])
    return { doc: next }
  }),
  replaceDoc: (d) => set({ doc: d }),
  resetForTest: () => set({
    doc: emptyDoc(),
    activeTool: 'select',
    hoveredShapeId: null,
    draftShape: null,
    isDragging: false,
    inlineEditShapeId: null,
    layout: DEFAULT_LAYOUT,
  }),
}))
```

- [ ] **Step 3: Run + commit**

```bash
bun run test:run src/store/editor-store.test.ts
git commit -am "feat(store): add Zustand editor store with basic actions"
```

---

### Task 22: Undo/redo history with coalescing

**Files:**
- Create: `src/store/history.ts`, `src/store/history.test.ts`
- Modify: `src/store/editor-store.ts`

- [ ] **Step 1: Test**

```ts
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useEditor } from './editor-store'

beforeEach(() => { useEditor.getState().resetForTest() })

describe('history', () => {
  it('undo restores previous doc', () => {
    const s0 = useEditor.getState().doc
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'A' }))
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'B' }))
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('A')
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe(s0.name)
  })
  it('redo replays a previously-undone change', () => {
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'A' }))
    useEditor.getState().undo()
    useEditor.getState().redo()
    expect(useEditor.getState().doc.name).toBe('A')
  })
  it('new change clears redo stack', () => {
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'A' }))
    useEditor.getState().undo()
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'B' }))
    useEditor.getState().redo() // should no-op
    expect(useEditor.getState().doc.name).toBe('B')
  })
  it('skipHistory changes do not push onto past', () => {
    useEditor.getState().applyDocChange(d => ({ ...d, name: 'A' }), { skipHistory: true })
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('A')
  })
  it('beginCoalesce / endCoalesce collapse many edits into one history entry', () => {
    useEditor.getState().beginCoalesce()
    for (let i = 0; i < 5; i++) useEditor.getState().applyDocChange(d => ({ ...d, name: String(i) }))
    useEditor.getState().endCoalesce()
    useEditor.getState().undo()
    expect(useEditor.getState().doc.name).toBe('Untitled Mockup')
  })
})
```

- [ ] **Step 2: Implementation — src/store/history.ts**

```ts
import type { Doc } from '@/model/types'

const MAX_HISTORY = 100

export interface HistoryState {
  past: Doc[]
  future: Doc[]
  coalescing: boolean
  coalesceSnapshot: Doc | null
}

export function emptyHistory(): HistoryState {
  return { past: [], future: [], coalescing: false, coalesceSnapshot: null }
}

export function pushHistory(h: HistoryState, prev: Doc): HistoryState {
  const past = [...h.past, prev]
  if (past.length > MAX_HISTORY) past.shift()
  return { ...h, past, future: [] }
}
```

- [ ] **Step 3: Extend src/store/editor-store.ts**

Add to `EditorState` interface:
```ts
history: import('./history').HistoryState
undo: () => void
redo: () => void
beginCoalesce: () => void
endCoalesce: () => void
```

Update the store body:
```ts
import { emptyHistory, pushHistory } from './history'

// Inside create<EditorState>(...):
history: emptyHistory(),

applyDocChange: (fn, opts) => set(s => {
  const prev = s.doc
  const next = fn(prev)
  if (next === prev) return {}
  if (opts?.skipHistory) return { doc: next }
  if (s.history.coalescing) {
    // Snapshot the pre-coalesce state once; subsequent changes do not push.
    const h = s.history.coalesceSnapshot == null
      ? { ...s.history, coalesceSnapshot: prev }
      : s.history
    return { doc: next, history: h }
  }
  return { doc: next, history: pushHistory(s.history, prev) }
}),

undo: () => set(s => {
  if (s.history.past.length === 0) return {}
  const past = s.history.past.slice()
  const prev = past.pop()!
  return {
    doc: prev,
    history: { ...s.history, past, future: [...s.history.future, s.doc] },
  }
}),

redo: () => set(s => {
  if (s.history.future.length === 0) return {}
  const future = s.history.future.slice()
  const next = future.pop()!
  return {
    doc: next,
    history: { ...s.history, past: [...s.history.past, s.doc], future },
  }
}),

beginCoalesce: () => set(s => ({
  history: { ...s.history, coalescing: true, coalesceSnapshot: null },
})),

endCoalesce: () => set(s => {
  const snap = s.history.coalesceSnapshot
  if (!s.history.coalescing || snap == null) {
    return { history: { ...s.history, coalescing: false, coalesceSnapshot: null } }
  }
  return {
    history: {
      ...pushHistory(s.history, snap),
      coalescing: false,
      coalesceSnapshot: null,
    },
  }
}),
```

Also update `resetForTest` to include `history: emptyHistory()`.

- [ ] **Step 4: Run + commit**

```bash
bun run test:run src/store
git commit -am "feat(store): add undo/redo with coalescing"
```

---

## Phase 7 — UI shell

### Task 23: Editor shell + TopBar

**Files:**
- Create: `src/components/Editor.tsx`, `src/components/TopBar.tsx`
- Modify: `src/app/page.tsx`

- [ ] **Step 1: Editor shell**

```tsx
'use client'

import TopBar from './TopBar'

export default function Editor() {
  return (
    <div className="flex h-screen flex-col bg-parchment">
      <TopBar />
      <div className="flex flex-1 overflow-hidden">
        <aside id="tool-palette" className="w-60 shrink-0 border-r border-border-cream bg-parchment p-3">
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">Tools</div>
        </aside>
        <main className="flex-1 overflow-auto p-6">
          <div className="mx-auto inline-block rounded-[32px] bg-ivory p-6 ring-border-warm shadow-whisper">
            <pre className="font-mono text-near-black leading-[1.1]">{`(canvas goes here)`}</pre>
          </div>
        </main>
        <aside id="inspector" className="w-72 shrink-0 border-l border-border-cream bg-parchment p-3">
          <div className="rounded-[12px] bg-ivory p-3 ring-border-warm">Inspector</div>
        </aside>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: TopBar**

```tsx
'use client'

export default function TopBar() {
  return (
    <header className="flex h-14 items-center justify-between border-b border-border-cream bg-parchment px-4">
      <h1 className="font-serif text-[25px] font-medium text-near-black">ASCII Mockups</h1>
      <div className="flex items-center gap-2">
        <button className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-ring-warm">
          New
        </button>
        <button className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-ring-warm">
          Open
        </button>
        <button className="rounded-[8px] bg-terracotta px-3 py-1.5 text-sm text-ivory ring-1 ring-terracotta">
          Copy ASCII
        </button>
      </div>
    </header>
  )
}
```

- [ ] **Step 3: Update page.tsx**

```tsx
import Editor from '@/components/Editor'
export default function Home() { return <Editor /> }
```

- [ ] **Step 4: Verify via Playwright MCP**

Run `bun run dev`. Use Playwright MCP to navigate to `http://localhost:3000`, take a screenshot, and confirm three panes + topbar with Parchment bg and Terracotta CTA.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): add editor shell with top bar and three panes"
```

---

### Task 24: Tool palette

**Files:**
- Create: `src/components/ToolPalette.tsx`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client'

import { useEditor } from '@/store/editor-store'
import type { ToolId } from '@/model/types'

interface ToolDef { id: ToolId; label: string; key?: string }

const BASIC: ToolDef[] = [
  { id: 'select', label: 'Select', key: 'V' },
  { id: 'rectangle', label: 'Rectangle', key: 'R' },
  { id: 'ellipse', label: 'Ellipse', key: 'O' },
  { id: 'line', label: 'Line', key: 'L' },
  { id: 'arrow', label: 'Arrow', key: 'A' },
  { id: 'text', label: 'Text', key: 'T' },
]

const TEMPLATES: ToolDef[] = [
  { id: 'button', label: 'Button', key: 'B' },
  { id: 'image-placeholder', label: 'Image' },
  { id: 'textfield', label: 'Text Field' },
  { id: 'textarea', label: 'Text Area' },
  { id: 'checkbox', label: 'Checkbox' },
  { id: 'icon', label: 'Icon' },
  { id: 'card', label: 'Card' },
  { id: 'modal', label: 'Modal' },
  { id: 'mobile-device', label: 'Mobile Device' },
  { id: 'browser', label: 'Browser' },
  { id: 'tab-bar', label: 'Tab Bar' },
  { id: 'nav-bar', label: 'Nav Bar' },
  { id: 'status-bar', label: 'Status Bar' },
]

export default function ToolPalette() {
  const active = useEditor(s => s.activeTool)
  const setActiveTool = useEditor(s => s.setActiveTool)
  return (
    <div className="space-y-4">
      <ToolGroup title="Basic" tools={BASIC} active={active} onPick={setActiveTool} />
      <ToolGroup title="Templates" tools={TEMPLATES} active={active} onPick={setActiveTool} />
    </div>
  )
}

function ToolGroup({ title, tools, active, onPick }: {
  title: string; tools: ToolDef[]; active: ToolId; onPick: (t: ToolId) => void
}) {
  return (
    <section aria-label={title}>
      <h2 className="mb-2 font-serif text-base text-olive-gray">{title}</h2>
      <div className="grid grid-cols-2 gap-2">
        {tools.map(t => (
          <button
            key={t.id}
            onClick={() => onPick(t.id)}
            aria-pressed={active === t.id}
            className={
              'rounded-[8px] px-2 py-2 text-left text-sm text-charcoal-warm ring-1 ' +
              (active === t.id ? 'bg-warm-sand ring-terracotta' : 'bg-warm-sand ring-ring-warm hover:ring-ring-deep')
            }
          >
            {t.label}{t.key ? <span className="ml-1 text-xs text-stone-gray">{t.key}</span> : null}
          </button>
        ))}
      </div>
    </section>
  )
}
```

- [ ] **Step 2: Mount it in Editor's left pane**

Replace the left-pane placeholder:
```tsx
import ToolPalette from './ToolPalette'
// ...
<aside id="tool-palette" className="w-60 shrink-0 border-r border-border-cream bg-parchment p-3">
  <div className="rounded-[12px] bg-ivory p-3 ring-border-warm"><ToolPalette /></div>
</aside>
```

- [ ] **Step 3: Integration test**

`src/components/ToolPalette.test.tsx`:
```tsx
import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ToolPalette from './ToolPalette'
import { useEditor } from '@/store/editor-store'

beforeEach(() => { useEditor.getState().resetForTest() })

describe('ToolPalette', () => {
  it('clicking a tool updates active tool', async () => {
    render(<ToolPalette />)
    await userEvent.click(screen.getByRole('button', { name: /Rectangle/ }))
    expect(useEditor.getState().activeTool).toBe('rectangle')
  })
})
```

- [ ] **Step 4: Run + verify visually via Playwright MCP**

```bash
bun run test:run src/components/ToolPalette.test.tsx
```

Then with Playwright MCP click "Rectangle" and confirm the button gains the Terracotta ring.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): add tool palette"
```

---

### Task 25: Canvas render + cell metrics

**Files:**
- Create: `src/components/Canvas.tsx`, `src/hooks/useCellMetrics.ts`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: useCellMetrics hook**

```ts
'use client'
import { useEffect, useRef, useState } from 'react'

export interface CellMetrics { charW: number; charH: number }

export function useCellMetrics(fontClass = 'font-mono'): [React.RefObject<HTMLSpanElement>, CellMetrics] {
  const ref = useRef<HTMLSpanElement>(null)
  const [metrics, setMetrics] = useState<CellMetrics>({ charW: 9, charH: 16 })
  useEffect(() => {
    const measure = () => {
      const el = ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      setMetrics({ charW: rect.width / 2, charH: rect.height })
    }
    if (document.fonts?.ready) document.fonts.ready.then(measure)
    else measure()
    const ro = new ResizeObserver(measure)
    if (ref.current) ro.observe(ref.current)
    return () => ro.disconnect()
  }, [fontClass])
  return [ref, metrics]
}
```

- [ ] **Step 2: Canvas component**

```tsx
'use client'
import { useMemo } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { useCellMetrics } from '@/hooks/useCellMetrics'

export default function Canvas() {
  const doc = useEditor(s => s.doc)
  const text = useMemo(() => toText(render(doc)), [doc])
  const [probeRef] = useCellMetrics()
  return (
    <div className="relative inline-block">
      <span ref={probeRef} className="absolute -left-[9999px] font-mono leading-[1.1]" aria-hidden>
        MM
      </span>
      <pre
        className="m-0 font-mono leading-[1.1] text-near-black"
        style={{ whiteSpace: 'pre', tabSize: 1 }}
      >
        {text || ' '.repeat(doc.gridW)}
      </pre>
    </div>
  )
}
```

- [ ] **Step 3: Mount in Editor**

```tsx
import Canvas from './Canvas'
// ...
<main className="flex-1 overflow-auto p-6">
  <div className="inline-block rounded-[32px] bg-ivory p-6 ring-border-warm shadow-whisper">
    <Canvas />
  </div>
</main>
```

- [ ] **Step 4: Verify via Playwright MCP**

Run `bun run dev`, navigate with Playwright MCP. The canvas should show a blank grid. Temporarily inject a rect via the dev store to confirm rendering:

```ts
import { useEditor } from '@/store/editor-store'
import { createTemplate } from '@/templates'
useEditor.getState().addShapeAndSelect(createTemplate('rectangle', 5, 3))
```

After verification remove the injection.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): render canvas from doc"
```

---

### Task 26: SelectionOverlay + drawing tools

**Files:**
- Create: `src/components/SelectionOverlay.tsx`, `src/hooks/useTool.ts`
- Modify: `src/components/Canvas.tsx`

- [ ] **Step 1: useTool hook — click-drag drawing and select**

```ts
'use client'
import { useCallback, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import type { Shape } from '@/model/types'
import { createTemplate } from '@/templates'
import { setSelection, addShape, updateShape } from '@/model/doc-ops'
import { newId } from '@/lib/ids'

export interface CanvasPointer { x: number; y: number } // cell coords

const DRAWING_TOOLS = new Set(['rectangle','ellipse','line','arrow','text'])
const TEMPLATE_TOOLS = new Set([
  'button','image-placeholder','textfield','textarea','mobile-device','browser',
  'tab-bar','nav-bar','status-bar','checkbox','icon','card','modal',
])

export function useTool() {
  const startRef = useRef<CanvasPointer | null>(null)
  const draftIdRef = useRef<string | null>(null)

  const onPointerDown = useCallback((p: CanvasPointer) => {
    const st = useEditor.getState()
    const { activeTool } = st
    if (DRAWING_TOOLS.has(activeTool)) {
      startRef.current = p
      const id = newId()
      draftIdRef.current = id
      const seed = createTemplate(activeTool as any, p.x, p.y)
      const shape: Shape = { ...seed, id, x: p.x, y: p.y, w: 1, h: 1 }
      st.beginCoalesce()
      st.applyDocChange(d => addShape(d, shape))
      st.applyDocChange(d => setSelection(d, [id]))
      return
    }
    if (TEMPLATE_TOOLS.has(activeTool)) {
      const shape = createTemplate(activeTool as any, p.x, p.y)
      st.applyDocChange(d => setSelection(addShape(d, shape), [shape.id]))
      st.setActiveTool('select')
      return
    }
    if (activeTool === 'select') {
      const hit = st.doc.shapes.slice().reverse().find(s =>
        !s.locked && !s.hidden && p.x >= s.x && p.x < s.x + s.w && p.y >= s.y && p.y < s.y + s.h,
      )
      st.applyDocChange(d => setSelection(d, hit ? [hit.id] : []), { skipHistory: true })
    }
  }, [])

  const onPointerMove = useCallback((p: CanvasPointer) => {
    const st = useEditor.getState()
    if (!startRef.current || !draftIdRef.current) return
    const sx = startRef.current.x, sy = startRef.current.y
    const x = Math.min(sx, p.x), y = Math.min(sy, p.y)
    const w = Math.max(1, Math.abs(p.x - sx) + 1)
    const h = Math.max(1, Math.abs(p.y - sy) + 1)
    const id = draftIdRef.current
    st.applyDocChange(d => updateShape(d, id, { x, y, w, h } as any))
  }, [])

  const onPointerUp = useCallback(() => {
    const st = useEditor.getState()
    if (draftIdRef.current) st.endCoalesce()
    startRef.current = null
    draftIdRef.current = null
    const active = st.activeTool
    if (DRAWING_TOOLS.has(active)) st.setActiveTool('select')
  }, [])

  return { onPointerDown, onPointerMove, onPointerUp }
}
```

- [ ] **Step 2: Canvas pointer wiring**

```tsx
'use client'
import { useMemo, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { useCellMetrics } from '@/hooks/useCellMetrics'
import { useTool } from '@/hooks/useTool'
import SelectionOverlay from './SelectionOverlay'

export default function Canvas() {
  const doc = useEditor(s => s.doc)
  const preRef = useRef<HTMLPreElement>(null)
  const [probeRef, metrics] = useCellMetrics()
  const tool = useTool()
  const text = useMemo(() => toText(render(doc)), [doc])

  const toCell = (e: React.PointerEvent) => {
    const el = preRef.current
    if (!el) return { x: 0, y: 0 }
    const rect = el.getBoundingClientRect()
    const x = Math.max(0, Math.min(doc.gridW - 1, Math.floor((e.clientX - rect.left) / metrics.charW)))
    const y = Math.max(0, Math.min(doc.gridH - 1, Math.floor((e.clientY - rect.top) / metrics.charH)))
    return { x, y }
  }

  return (
    <div className="relative inline-block">
      <span ref={probeRef} className="absolute -left-[9999px] font-mono leading-[1.1]" aria-hidden>MM</span>
      <pre
        ref={preRef}
        className="m-0 select-none font-mono leading-[1.1] text-near-black"
        style={{ whiteSpace: 'pre', tabSize: 1 }}
        onPointerDown={(e) => { (e.target as Element).setPointerCapture?.(e.pointerId); tool.onPointerDown(toCell(e)) }}
        onPointerMove={(e) => tool.onPointerMove(toCell(e))}
        onPointerUp={(e) => tool.onPointerUp()}
      >
        {text || ' '.repeat(doc.gridW) + '\n'.repeat(doc.gridH - 1)}
      </pre>
      <SelectionOverlay charW={metrics.charW} charH={metrics.charH} />
    </div>
  )
}
```

- [ ] **Step 3: SelectionOverlay component**

```tsx
'use client'
import { useEditor } from '@/store/editor-store'

export default function SelectionOverlay({ charW, charH }: { charW: number; charH: number }) {
  const doc = useEditor(s => s.doc)
  const selected = doc.shapes.filter(s => doc.selection.includes(s.id))
  return (
    <div className="pointer-events-none absolute inset-0">
      {selected.map(s => (
        <div
          key={s.id}
          className="absolute border border-dashed border-terracotta"
          style={{
            left: s.x * charW - 1,
            top: s.y * charH - 1,
            width: s.w * charW + 2,
            height: s.h * charH + 2,
          }}
        />
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Manual verification via Playwright MCP**

`bun run dev`, pick Rectangle in the palette, click-drag on the canvas. Expected: a rectangle is drawn, the tool auto-switches back to Select, the rect has a dashed Terracotta outline. Confirm with screenshot.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): add drawing tools and selection overlay"
```

---

### Task 27: Move & resize by pointer, keyboard nudge

**Files:**
- Modify: `src/hooks/useTool.ts`, `src/components/SelectionOverlay.tsx`
- Create: `src/hooks/useKeyboard.ts`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Add 8 resize handles to SelectionOverlay**

Replace the overlay with one that draws 8 handles on the first selected shape, each with a `data-handle` attribute (`nw`, `n`, `ne`, `e`, `se`, `s`, `sw`, `w`).

```tsx
'use client'
import { useEditor } from '@/store/editor-store'

const HANDLES = ['nw','n','ne','e','se','s','sw','w'] as const
export type Handle = typeof HANDLES[number]

export default function SelectionOverlay({ charW, charH }: { charW: number; charH: number }) {
  const doc = useEditor(s => s.doc)
  const primary = doc.shapes.find(s => s.id === doc.selection[0])
  if (!primary) return null
  const { x, y, w, h } = primary
  return (
    <div className="pointer-events-none absolute inset-0">
      <div
        className="absolute border border-dashed border-terracotta"
        style={{ left: x * charW - 1, top: y * charH - 1, width: w * charW + 2, height: h * charH + 2 }}
      />
      {HANDLES.map(handle => {
        const pos = handlePos(handle, x, y, w, h, charW, charH)
        return (
          <div
            key={handle}
            data-handle={handle}
            className="pointer-events-auto absolute h-2 w-2 -translate-x-1 -translate-y-1 cursor-pointer border border-terracotta bg-ivory"
            style={{ left: pos.left, top: pos.top, cursor: cursorFor(handle) }}
          />
        )
      })}
    </div>
  )
}

function handlePos(handle: Handle, x: number, y: number, w: number, h: number, cw: number, ch: number) {
  const L = x * cw, T = y * ch, R = (x + w) * cw, B = (y + h) * ch
  const MX = (L + R) / 2, MY = (T + B) / 2
  switch (handle) {
    case 'nw': return { left: L, top: T }
    case 'n':  return { left: MX, top: T }
    case 'ne': return { left: R, top: T }
    case 'e':  return { left: R, top: MY }
    case 'se': return { left: R, top: B }
    case 's':  return { left: MX, top: B }
    case 'sw': return { left: L, top: B }
    case 'w':  return { left: L, top: MY }
  }
}

function cursorFor(h: Handle): string {
  return ({
    nw:'nwse-resize', se:'nwse-resize', ne:'nesw-resize', sw:'nesw-resize',
    n:'ns-resize', s:'ns-resize', e:'ew-resize', w:'ew-resize',
  } as const)[h]
}
```

- [ ] **Step 2: Extend useTool to support move & resize**

In `useTool.ts`, before the drawing branch, add a handler for `select` tool that detects:
- click on a handle → start resize
- click inside a selected shape → start move
- click on another shape → select it, then start move

```ts
// NEW: interaction kinds
type Interaction =
  | { kind: 'draw'; startX: number; startY: number; shapeId: string }
  | { kind: 'move'; startX: number; startY: number; originals: Map<string, { x: number; y: number }> }
  | { kind: 'resize'; handle: string; shape: Shape }

const interactionRef = useRef<Interaction | null>(null)
```

Within `onPointerDown`, detect `e.target` handle via a new signature — pass the DOM target in too, so change the hook to take `(p: CanvasPointer, target?: Element)` and have the Canvas forward `e.target`. Then:

```ts
const onPointerDown = useCallback((p: CanvasPointer, target?: Element) => {
  const st = useEditor.getState()
  const tool = st.activeTool
  const handle = target?.closest('[data-handle]')?.getAttribute('data-handle') ?? null

  if (tool === 'select') {
    if (handle) {
      const primary = st.doc.shapes.find(s => s.id === st.doc.selection[0])
      if (primary) {
        interactionRef.current = { kind: 'resize', handle, shape: primary }
        st.beginCoalesce()
        return
      }
    }
    const hit = st.doc.shapes.slice().reverse().find(s =>
      !s.locked && !s.hidden && p.x >= s.x && p.x < s.x + s.w && p.y >= s.y && p.y < s.y + s.h,
    )
    if (hit) {
      const alreadySelected = st.doc.selection.includes(hit.id)
      if (!alreadySelected) st.applyDocChange(d => setSelection(d, [hit.id]), { skipHistory: true })
      const originals = new Map(
        (alreadySelected ? st.doc.selection : [hit.id])
          .map(id => {
            const sh = st.doc.shapes.find(s => s.id === id)!
            return [id, { x: sh.x, y: sh.y }] as const
          }),
      )
      interactionRef.current = { kind: 'move', startX: p.x, startY: p.y, originals }
      st.beginCoalesce()
    } else {
      st.applyDocChange(d => setSelection(d, []), { skipHistory: true })
    }
    return
  }
  // ...existing draw + template branches unchanged
}, [])
```

In `onPointerMove` handle move/resize:

```ts
const onPointerMove = useCallback((p: CanvasPointer) => {
  const st = useEditor.getState()
  const i = interactionRef.current
  if (i?.kind === 'move') {
    const dx = p.x - i.startX, dy = p.y - i.startY
    st.applyDocChange(d => ({
      ...d,
      shapes: d.shapes.map(s => {
        const orig = i.originals.get(s.id)
        return orig ? { ...s, x: orig.x + dx, y: orig.y + dy } : s
      }),
    }))
    return
  }
  if (i?.kind === 'resize') {
    const s = i.shape
    let { x, y, w, h } = s
    const dx = p.x - (s.x + s.w), dy = p.y - (s.y + s.h)
    if (i.handle.includes('e')) w = Math.max(1, p.x - s.x + 1)
    if (i.handle.includes('s')) h = Math.max(1, p.y - s.y + 1)
    if (i.handle.includes('w')) { const nx = Math.min(p.x, s.x + s.w - 1); w = s.x + s.w - nx; x = nx }
    if (i.handle.includes('n')) { const ny = Math.min(p.y, s.y + s.h - 1); h = s.y + s.h - ny; y = ny }
    st.applyDocChange(d => ({
      ...d,
      shapes: d.shapes.map(sh => sh.id === s.id ? { ...sh, x, y, w, h } : sh),
    }))
    return
  }
  // existing draft path unchanged
}, [])
```

In `onPointerUp`, also end coalesce for move/resize and clear `interactionRef`.

- [ ] **Step 3: useKeyboard hook**

```ts
'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { removeShapes, updateShape } from '@/model/doc-ops'

export function useKeyboard() {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      const st = useEditor.getState()
      const meta = e.metaKey || e.ctrlKey
      if (meta && e.key.toLowerCase() === 'z') {
        e.preventDefault(); e.shiftKey ? st.redo() : st.undo(); return
      }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (st.doc.selection.length > 0) {
          e.preventDefault()
          st.applyDocChange(d => removeShapes(d, d.selection))
        }
        return
      }
      if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) {
        if (st.doc.selection.length === 0) return
        e.preventDefault()
        const step = e.shiftKey ? 10 : 1
        const dx = e.key === 'ArrowLeft' ? -step : e.key === 'ArrowRight' ? step : 0
        const dy = e.key === 'ArrowUp' ? -step : e.key === 'ArrowDown' ? step : 0
        st.applyDocChange(d => ({
          ...d,
          shapes: d.shapes.map(s => d.selection.includes(s.id) ? { ...s, x: s.x + dx, y: s.y + dy } : s),
        }))
        return
      }
      // tool hotkeys (lowercase only, no modifiers)
      if (!meta && !e.altKey) {
        const map: Record<string, string> = {
          v: 'select', r: 'rectangle', o: 'ellipse', l: 'line',
          a: 'arrow', t: 'text', b: 'button',
        }
        const tool = map[e.key.toLowerCase()]
        if (tool) st.setActiveTool(tool as any)
      }
    }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [])
}
```

- [ ] **Step 4: Mount useKeyboard inside Editor**

```tsx
import { useKeyboard } from '@/hooks/useKeyboard'
export default function Editor() {
  useKeyboard()
  // ...
}
```

- [ ] **Step 5: Verify via Playwright MCP**

Draw a rectangle → select → arrow key nudges it → drag to move → drag SE handle to resize → Delete removes → Cmd+Z restores.

- [ ] **Step 6: Commit**

```bash
git commit -am "feat(ui): move, resize, keyboard shortcuts, nudging"
```

---

### Task 28: Inspector

**Files:**
- Create: `src/components/Inspector.tsx`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Implementation — generic shape fields + per-type specialized fields**

```tsx
'use client'
import { useEditor } from '@/store/editor-store'
import { updateShape } from '@/model/doc-ops'
import type { Shape } from '@/model/types'

export default function Inspector() {
  const doc = useEditor(s => s.doc)
  const apply = useEditor(s => s.applyDocChange)
  const sel = doc.shapes.find(s => s.id === doc.selection[0])
  if (!sel) return <p className="text-sm text-stone-gray">No selection.</p>
  const onChange = (patch: Partial<Shape>) => apply(d => updateShape(d, sel.id, patch))

  return (
    <div className="space-y-3 text-sm">
      <h3 className="font-serif text-base text-olive-gray capitalize">{sel.type.replace('-', ' ')}</h3>
      <div className="grid grid-cols-2 gap-2">
        <NumberField label="x" value={sel.x} onChange={v => onChange({ x: v } as any)} />
        <NumberField label="y" value={sel.y} onChange={v => onChange({ y: v } as any)} />
        <NumberField label="w" value={sel.w} min={1} onChange={v => onChange({ w: v } as any)} />
        <NumberField label="h" value={sel.h} min={1} onChange={v => onChange({ h: v } as any)} />
      </div>
      <TypeSpecificFields shape={sel} onChange={onChange} />
    </div>
  )
}

function NumberField({ label, value, onChange, min }: { label: string; value: number; onChange: (v: number) => void; min?: number }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">{label}</span>
      <input
        type="number"
        min={min}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm focus:ring-focus-blue focus:outline-none"
      />
    </label>
  )
}

function TextField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">{label}</span>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm focus:ring-focus-blue focus:outline-none"
      />
    </label>
  )
}

function TypeSpecificFields({ shape, onChange }: { shape: Shape; onChange: (p: Partial<Shape>) => void }) {
  switch (shape.type) {
    case 'rectangle':
      return <StyleSelect value={shape.style} options={['single','double','rounded','bold','ascii']} onChange={v => onChange({ style: v } as any)} />
    case 'text':
      return (
        <>
          <TextField label="text" value={shape.text} onChange={v => onChange({ text: v } as any)} />
          <StyleSelect value={shape.align} options={['left','center','right']} onChange={v => onChange({ align: v } as any)} />
          <label className="flex items-center gap-2 text-xs text-stone-gray">
            <input type="checkbox" checked={shape.wrap} onChange={e => onChange({ wrap: e.target.checked } as any)} />
            wrap
          </label>
        </>
      )
    case 'button':
      return (
        <>
          <TextField label="label" value={shape.label} onChange={v => onChange({ label: v } as any)} />
          <StyleSelect value={shape.variant} options={['square','rounded','double']} onChange={v => onChange({ variant: v } as any)} />
        </>
      )
    case 'checkbox':
      return (
        <>
          <TextField label="label" value={shape.label} onChange={v => onChange({ label: v } as any)} />
          <label className="flex items-center gap-2 text-xs text-stone-gray">
            <input type="checkbox" checked={shape.checked} onChange={e => onChange({ checked: e.target.checked } as any)} />
            checked
          </label>
        </>
      )
    case 'textfield':
      return (
        <>
          <TextField label="label" value={shape.label} onChange={v => onChange({ label: v } as any)} />
          <TextField label="placeholder" value={shape.placeholder} onChange={v => onChange({ placeholder: v } as any)} />
          <TextField label="value" value={shape.value} onChange={v => onChange({ value: v } as any)} />
        </>
      )
    case 'textarea':
      return (
        <>
          <TextField label="label" value={shape.label} onChange={v => onChange({ label: v } as any)} />
          <TextField label="value" value={shape.value} onChange={v => onChange({ value: v } as any)} />
        </>
      )
    case 'browser':
      return (
        <>
          <TextField label="url" value={shape.url} onChange={v => onChange({ url: v } as any)} />
          <TextField label="title" value={shape.title} onChange={v => onChange({ title: v } as any)} />
        </>
      )
    case 'nav-bar':
      return <TextField label="title" value={shape.title} onChange={v => onChange({ title: v } as any)} />
    case 'tab-bar':
      return <TextField label="tabs (comma)" value={shape.tabs.join(',')} onChange={v => onChange({ tabs: v.split(',').map(t => t.trim()) } as any)} />
    case 'card':
    case 'modal':
      return (
        <>
          <TextField label="title" value={shape.title} onChange={v => onChange({ title: v } as any)} />
          <TextField label="body" value={shape.body} onChange={v => onChange({ body: v } as any)} />
        </>
      )
    case 'icon':
      return <TextField label="glyph" value={shape.glyph} onChange={v => onChange({ glyph: v } as any)} />
    case 'status-bar':
      return <TextField label="time" value={shape.time} onChange={v => onChange({ time: v } as any)} />
    default:
      return null
  }
}

function StyleSelect<T extends string>({ value, options, onChange }: { value: T; options: readonly T[]; onChange: (v: T) => void }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs text-stone-gray">style</span>
      <select
        value={value}
        onChange={e => onChange(e.target.value as T)}
        className="rounded-[6px] bg-pure-white px-2 py-1 ring-1 ring-border-warm"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  )
}
```

- [ ] **Step 2: Mount in Editor right pane (top half)**

```tsx
import Inspector from './Inspector'
// ...
<aside id="inspector" className="w-72 shrink-0 border-l border-border-cream bg-parchment p-3 flex flex-col gap-3">
  <div className="rounded-[12px] bg-ivory p-3 ring-border-warm"><Inspector /></div>
</aside>
```

- [ ] **Step 3: Verify via Playwright MCP**

Select a shape and change its properties. Confirm the canvas reflects the change live.

- [ ] **Step 4: Commit**

```bash
git commit -am "feat(ui): add inspector with per-type fields"
```

---

### Task 29: Layer panel

**Files:**
- Create: `src/components/LayerPanel.tsx`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: Implementation**

```tsx
'use client'
import { useEditor } from '@/store/editor-store'
import { setSelection, updateShape, bringForward, sendBackward, removeShapes } from '@/model/doc-ops'

export default function LayerPanel() {
  const doc = useEditor(s => s.doc)
  const apply = useEditor(s => s.applyDocChange)
  const shapes = [...doc.shapes].reverse() // top-most first in the list
  return (
    <div className="space-y-1 text-sm">
      <h3 className="mb-2 font-serif text-base text-olive-gray">Layers</h3>
      {shapes.length === 0 && <p className="text-xs text-stone-gray">No layers.</p>}
      {shapes.map((s, idx) => {
        const selected = doc.selection.includes(s.id)
        return (
          <div
            key={s.id}
            className={
              'flex items-center justify-between rounded-[6px] px-2 py-1 ' +
              (selected ? 'bg-warm-sand' : 'hover:bg-warm-sand/60')
            }
          >
            <button
              className="flex-1 truncate text-left text-charcoal-warm"
              onClick={() => apply(d => setSelection(d, [s.id]), { skipHistory: true })}
            >
              <span className="mr-2 text-stone-gray">{s.type}</span>
              {s.name ?? `${s.w}x${s.h}`}
            </button>
            <button
              title="toggle visibility"
              className="px-1 text-stone-gray"
              onClick={() => apply(d => updateShape(d, s.id, { hidden: !s.hidden } as any))}
            >{s.hidden ? '◌' : '●'}</button>
            <button
              title="toggle lock"
              className="px-1 text-stone-gray"
              onClick={() => apply(d => updateShape(d, s.id, { locked: !s.locked } as any))}
            >{s.locked ? '🔒' : '🔓'}</button>
            <button
              title="bring forward"
              className="px-1 text-stone-gray"
              onClick={() => apply(d => bringForward(d, s.id))}
            >↑</button>
            <button
              title="send backward"
              className="px-1 text-stone-gray"
              onClick={() => apply(d => sendBackward(d, s.id))}
            >↓</button>
            <button
              title="delete"
              className="px-1 text-error-crimson"
              onClick={() => apply(d => removeShapes(d, [s.id]))}
            >✕</button>
          </div>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: Mount below Inspector**

```tsx
import LayerPanel from './LayerPanel'
// ...
<div className="rounded-[12px] bg-ivory p-3 ring-border-warm"><LayerPanel /></div>
```

- [ ] **Step 3: Verify + commit**

```bash
git commit -am "feat(ui): add layer panel"
```

---

### Task 30: Resizable panes

**Files:**
- Create: `src/components/Resizer.tsx`
- Modify: `src/components/Editor.tsx`, `src/store/editor-store.ts`

- [ ] **Step 1: Resizer component**

```tsx
'use client'
import { useRef } from 'react'

interface Props {
  side: 'left' | 'right'
  value: number
  onChange: (v: number) => void
  onReset: () => void
  min?: number
  max?: number
}

export default function Resizer({ side, value, onChange, onReset, min = 180, max = 480 }: Props) {
  const startRef = useRef<{ x: number; start: number } | null>(null)
  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture(e.pointerId)
    startRef.current = { x: e.clientX, start: value }
  }
  const onPointerMove = (e: React.PointerEvent) => {
    const s = startRef.current
    if (!s) return
    const dx = e.clientX - s.x
    const signed = side === 'left' ? dx : -dx
    const next = Math.max(min, Math.min(max, s.start + signed))
    onChange(next)
  }
  const onPointerUp = () => { startRef.current = null }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const d = e.key === 'ArrowLeft' ? -20 : 20
      const signed = side === 'left' ? d : -d
      onChange(Math.max(min, Math.min(max, value + signed)))
      e.preventDefault()
    }
  }
  return (
    <div
      role="separator"
      tabIndex={0}
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onKeyDown={onKeyDown}
      onDoubleClick={onReset}
      className="w-1 shrink-0 cursor-ew-resize bg-border-cream hover:bg-ring-warm"
    />
  )
}
```

- [ ] **Step 2: Persist layout widths**

Add to `editor-store.ts` after the store creation:
```ts
import { load, save } from '@/lib/local-storage'

useEditor.subscribe((state, prev) => {
  if (state.layout !== prev.layout) save('ascii-mockups:layout', state.layout)
})
const persistedLayout = load<{ leftW: number; rightW: number }>('ascii-mockups:layout')
if (persistedLayout) useEditor.setState({ layout: persistedLayout })
```

(The `load`/`save` helpers come from Task 31; if this task is implemented before Task 31, wire the persistence at the same step.)

- [ ] **Step 3: Use Resizer in Editor**

```tsx
import Resizer from './Resizer'
// In Editor:
const leftW = useEditor(s => s.layout.leftW)
const rightW = useEditor(s => s.layout.rightW)
const setLayout = useEditor(s => s.setLayout)
// ...
<aside style={{ width: leftW }} className="...">{/* palette */}</aside>
<Resizer side="left" value={leftW} onChange={v => setLayout({ leftW: v })} onReset={() => setLayout({ leftW: 240 })} />
<main>...</main>
<Resizer side="right" value={rightW} onChange={v => setLayout({ rightW: v })} onReset={() => setLayout({ rightW: 280 })} />
<aside style={{ width: rightW }} className="...">{/* inspector + layers */}</aside>
```

- [ ] **Step 4: Commit**

```bash
git commit -am "feat(ui): resizable panes with persisted widths"
```

---

## Phase 8 — Features

### Task 31: LocalStorage persistence + autosave

**Files:**
- Create: `src/lib/local-storage.ts`, `src/hooks/useAutosave.ts`
- Modify: `src/components/Editor.tsx`

- [ ] **Step 1: local-storage helpers**

```ts
export function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch { return null }
}

export function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try { window.localStorage.setItem(key, JSON.stringify(value)) } catch {}
}

export function remove(key: string): void {
  if (typeof window === 'undefined') return
  window.localStorage.removeItem(key)
}

export function listKeysPrefixed(prefix: string): string[] {
  if (typeof window === 'undefined') return []
  const out: string[] = []
  for (let i = 0; i < window.localStorage.length; i++) {
    const k = window.localStorage.key(i)
    if (k && k.startsWith(prefix)) out.push(k)
  }
  return out
}
```

- [ ] **Step 2: useAutosave hook**

```ts
'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { save, load } from '@/lib/local-storage'
import type { Doc } from '@/model/types'

interface IndexEntry { id: string; name: string; updatedAt: number }

const DOC_KEY = (id: string) => `ascii-mockups:doc:${id}`
const INDEX_KEY = 'ascii-mockups:docs-index'
const CURRENT_KEY = 'ascii-mockups:current-doc-id'

export function useAutosave(delayMs = 800) {
  useEffect(() => {
    // Restore last session
    const currentId = load<string>(CURRENT_KEY)
    if (currentId) {
      const d = load<Doc>(DOC_KEY(currentId))
      if (d) useEditor.getState().replaceDoc(d)
    }
    let timer: ReturnType<typeof setTimeout> | null = null
    const unsubscribe = useEditor.subscribe((state, prev) => {
      if (state.doc === prev.doc) return
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        const d = state.doc
        save(DOC_KEY(d.id), d)
        save(CURRENT_KEY, d.id)
        const existing = load<IndexEntry[]>(INDEX_KEY) ?? []
        const updated = [
          { id: d.id, name: d.name, updatedAt: d.updatedAt },
          ...existing.filter(e => e.id !== d.id),
        ]
        save(INDEX_KEY, updated)
      }, delayMs)
    })
    return () => { unsubscribe(); if (timer) clearTimeout(timer) }
  }, [delayMs])
}
```

- [ ] **Step 3: Mount in Editor**

```tsx
import { useAutosave } from '@/hooks/useAutosave'
// Inside Editor():
useAutosave()
```

- [ ] **Step 4: Verify**

In a browser, draw a shape, reload the page; the shape persists.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(persist): autosave to localStorage with docs index"
```

---

### Task 32: Open / New / Rename / Delete mockups

**Files:**
- Create: `src/components/OpenDocDropdown.tsx`
- Modify: `src/components/TopBar.tsx`, `src/store/editor-store.ts`

- [ ] **Step 1: Add store helpers**

```ts
// editor-store.ts additions
newDoc: () => set({ doc: emptyDoc() }),
renameDoc: (name: string) => set(s => ({ doc: { ...s.doc, name, updatedAt: Date.now() } })),
openDocById: (id: string) => {
  const d = load<Doc>(`ascii-mockups:doc:${id}`)
  if (d) set({ doc: d })
},
deleteDocById: (id: string) => {
  remove(`ascii-mockups:doc:${id}`)
  const idx = load<{id:string;name:string;updatedAt:number}[]>('ascii-mockups:docs-index') ?? []
  save('ascii-mockups:docs-index', idx.filter(e => e.id !== id))
},
```

- [ ] **Step 2: OpenDocDropdown component**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { useEditor } from '@/store/editor-store'
import { load } from '@/lib/local-storage'

interface Entry { id: string; name: string; updatedAt: number }

export default function OpenDocDropdown() {
  const [open, setOpen] = useState(false)
  const [items, setItems] = useState<Entry[]>([])
  const open_ = useEditor(s => s.openDocById)
  const del = useEditor(s => s.deleteDocById)
  useEffect(() => {
    if (open) setItems(load<Entry[]>('ascii-mockups:docs-index') ?? [])
  }, [open])
  return (
    <div className="relative">
      <button
        className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
        onClick={() => setOpen(o => !o)}
      >Open ▾</button>
      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-64 rounded-[12px] bg-ivory p-2 ring-1 ring-border-warm shadow-whisper">
          {items.length === 0 && <li className="px-2 py-1 text-sm text-stone-gray">No saved mockups</li>}
          {items.map(e => (
            <li key={e.id} className="flex items-center justify-between rounded-[6px] px-2 py-1 text-sm hover:bg-warm-sand">
              <button className="flex-1 text-left text-charcoal-warm" onClick={() => { open_(e.id); setOpen(false) }}>
                {e.name} <span className="ml-2 text-xs text-stone-gray">{relative(e.updatedAt)}</span>
              </button>
              <button
                className="text-error-crimson"
                onClick={() => { if (confirm(`Delete "${e.name}"?`)) del(e.id) }}
              >✕</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function relative(ts: number): string {
  const d = (Date.now() - ts) / 1000
  if (d < 60) return 'just now'
  if (d < 3600) return `${Math.floor(d / 60)}m ago`
  if (d < 86400) return `${Math.floor(d / 3600)}h ago`
  return `${Math.floor(d / 86400)}d ago`
}
```

- [ ] **Step 3: Rename in place (top bar)**

```tsx
// In TopBar, replace the h1 with an editable input:
const name = useEditor(s => s.doc.name)
const rename = useEditor(s => s.renameDoc)
return (
  // ...
  <input
    value={name}
    onChange={e => rename(e.target.value)}
    className="bg-transparent font-serif text-[25px] font-medium text-near-black outline-none focus:ring-1 focus:ring-focus-blue rounded px-1"
  />
)
```

Also add a `New` button that calls `useEditor.getState().newDoc()`.

- [ ] **Step 4: Verify + commit**

```bash
git commit -am "feat(docs): new/open/rename/delete multi-doc management"
```

---

### Task 33: Export — Copy ASCII, Download txt, PNG

**Files:**
- Create: `src/lib/clipboard.ts`, `src/lib/png-export.ts`, `src/components/ExportMenu.tsx`
- Modify: `src/components/TopBar.tsx`

- [ ] **Step 1: clipboard helper**

```ts
export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy'); return true } finally { document.body.removeChild(ta) }
  }
}
```

- [ ] **Step 2: PNG export**

```ts
import { render, toText } from '@/renderer'
import type { Doc } from '@/model/types'

export async function exportPng(doc: Doc, scale = 2): Promise<Blob> {
  const text = toText(render(doc))
  const lines = text.split('\n')
  const cols = Math.max(...lines.map(l => l.length), doc.gridW)
  const rows = Math.max(lines.length, doc.gridH)
  const charW = 10 * scale
  const charH = 18 * scale
  const canvas = document.createElement('canvas')
  canvas.width = cols * charW
  canvas.height = rows * charH
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#faf9f5'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#141413'
  ctx.font = `${14 * scale}px "SF Mono", Menlo, Consolas, monospace`
  ctx.textBaseline = 'top'
  for (let r = 0; r < lines.length; r++) ctx.fillText(lines[r], 0, r * charH)
  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(b => b ? resolve(b) : reject(new Error('png blob failed')), 'image/png')
  })
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 3: ExportMenu component**

```tsx
'use client'
import { useState } from 'react'
import { useEditor } from '@/store/editor-store'
import { render, toText } from '@/renderer'
import { copyText } from '@/lib/clipboard'
import { exportPng, downloadBlob } from '@/lib/png-export'

export default function ExportMenu() {
  const [open, setOpen] = useState(false)
  const doc = useEditor(s => s.doc)

  const copy = async () => { await copyText(toText(render(doc))) }
  const downloadTxt = () => {
    const blob = new Blob([toText(render(doc))], { type: 'text/plain' })
    downloadBlob(blob, `${doc.name}.txt`)
  }
  const downloadPng = async () => {
    const blob = await exportPng(doc)
    downloadBlob(blob, `${doc.name}.png`)
  }

  return (
    <div className="relative">
      <button
        onClick={copy}
        className="rounded-[8px] bg-terracotta px-3 py-1.5 text-sm text-ivory ring-1 ring-terracotta"
      >Copy ASCII</button>
      <button
        onClick={() => setOpen(o => !o)}
        className="ml-1 rounded-[8px] bg-warm-sand px-2 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
      >▾</button>
      {open && (
        <ul className="absolute right-0 z-10 mt-1 w-48 rounded-[12px] bg-ivory p-2 ring-1 ring-border-warm shadow-whisper">
          <li><button className="w-full rounded-[6px] px-2 py-1 text-left text-sm hover:bg-warm-sand" onClick={() => { downloadTxt(); setOpen(false) }}>Download .txt</button></li>
          <li><button className="w-full rounded-[6px] px-2 py-1 text-left text-sm hover:bg-warm-sand" onClick={() => { downloadPng(); setOpen(false) }}>Export PNG</button></li>
        </ul>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Mount in TopBar + verify via Playwright MCP**

Draw a shape, click Copy ASCII, then in a paste target (terminal, text file) verify content.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(export): copy ASCII, download txt, export PNG"
```

---

### Task 34: Grid-size settings + theme toggle + alignment guides

**Files:**
- Create: `src/components/SettingsMenu.tsx`, `src/components/ThemeToggle.tsx`, `src/components/AlignmentGuides.tsx`
- Modify: `src/components/TopBar.tsx`, `src/components/Canvas.tsx`, `src/hooks/useTool.ts`, `src/app/layout.tsx`

- [ ] **Step 1: Settings menu (grid size)**

```tsx
'use client'
import { useEditor } from '@/store/editor-store'

export default function SettingsMenu() {
  const doc = useEditor(s => s.doc)
  const apply = useEditor(s => s.applyDocChange)
  return (
    <div className="flex items-center gap-2 text-sm text-charcoal-warm">
      <label>W <input className="w-14 rounded bg-pure-white px-1 ring-1 ring-border-warm"
        type="number" min={10} max={200} value={doc.gridW}
        onChange={e => apply(d => ({ ...d, gridW: Math.max(10, Number(e.target.value)) }))} /></label>
      <label>H <input className="w-14 rounded bg-pure-white px-1 ring-1 ring-border-warm"
        type="number" min={5} max={120} value={doc.gridH}
        onChange={e => apply(d => ({ ...d, gridH: Math.max(5, Number(e.target.value)) }))} /></label>
    </div>
  )
}
```

- [ ] **Step 2: ThemeToggle**

```tsx
'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/local-storage'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<'light'|'dark'>('light')
  useEffect(() => {
    const t = load<{theme:'light'|'dark'}>('ascii-mockups:prefs')?.theme ?? 'light'
    setTheme(t); document.documentElement.dataset.theme = t
  }, [])
  const toggle = () => {
    const t = theme === 'light' ? 'dark' : 'light'
    setTheme(t); document.documentElement.dataset.theme = t
    save('ascii-mockups:prefs', { theme: t })
  }
  return (
    <button onClick={toggle} className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm">
      {theme === 'light' ? '☾' : '☀'}
    </button>
  )
}
```

- [ ] **Step 3: AlignmentGuides**

```tsx
'use client'
import { useEditor } from '@/store/editor-store'

export default function AlignmentGuides({ charW, charH }: { charW: number; charH: number }) {
  const doc = useEditor(s => s.doc)
  const isDragging = useEditor(s => s.isDragging)
  if (!isDragging || doc.selection.length === 0) return null
  const active = doc.shapes.filter(s => doc.selection.includes(s.id))
  const others = doc.shapes.filter(s => !doc.selection.includes(s.id) && !s.hidden)
  const lines: { x?: number; y?: number }[] = []
  for (const a of active) {
    for (const o of others) {
      for (const ax of [a.x, a.x + a.w - 1]) for (const ox of [o.x, o.x + o.w - 1]) if (ax === ox) lines.push({ x: ax })
      for (const ay of [a.y, a.y + a.h - 1]) for (const oy of [o.y, o.y + o.h - 1]) if (ay === oy) lines.push({ y: ay })
    }
  }
  return (
    <div className="pointer-events-none absolute inset-0">
      {lines.map((l, i) => l.x !== undefined
        ? <div key={i} className="absolute w-px bg-terracotta/70" style={{ left: l.x! * charW, top: 0, bottom: 0 }} />
        : <div key={i} className="absolute h-px bg-terracotta/70" style={{ top: l.y! * charH, left: 0, right: 0 }} />,
      )}
    </div>
  )
}
```

Wire `isDragging` in `useTool.ts`: set `st.setState({ isDragging: true })` in move/resize start, and `false` on pointerUp.

- [ ] **Step 4: Mount everything**

In `TopBar`: add `<SettingsMenu />`, `<ThemeToggle />`, `<ExportMenu />`.
In `Canvas`: add `<AlignmentGuides charW={...} charH={...} />` next to `<SelectionOverlay />`.
In `layout.tsx`: `<html lang="en" data-theme="light">`.

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(ui): grid-size settings, theme toggle, alignment guides"
```

---

### Task 35: Inline text edit + shape clipboard

**Files:**
- Create: `src/components/InlineTextEditor.tsx`, `src/hooks/useClipboard.ts`
- Modify: `src/components/Canvas.tsx`, `src/hooks/useKeyboard.ts`

- [ ] **Step 1: InlineTextEditor**

```tsx
'use client'
import { useEffect, useRef } from 'react'
import { useEditor } from '@/store/editor-store'
import { updateShape } from '@/model/doc-ops'
import type { Shape } from '@/model/types'

export default function InlineTextEditor({ charW, charH }: { charW: number; charH: number }) {
  const doc = useEditor(s => s.doc)
  const editingId = useEditor(s => s.inlineEditShapeId)
  const setEditing = useEditor(s => s.setInlineEdit)
  const apply = useEditor(s => s.applyDocChange)
  const ref = useRef<HTMLTextAreaElement>(null)
  const s = doc.shapes.find(s => s.id === editingId)
  useEffect(() => { ref.current?.focus() }, [editingId])
  if (!s) return null
  const field = textFieldOf(s)
  if (!field) return null
  const value = (s as any)[field] as string
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={e => apply(d => updateShape(d, s.id, { [field]: e.target.value } as any))}
      onBlur={() => setEditing(null)}
      onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); setEditing(null) } }}
      className="absolute resize-none rounded-sm bg-pure-white p-0 font-mono text-sm text-near-black outline outline-1 outline-terracotta"
      style={{ left: s.x * charW, top: s.y * charH, width: s.w * charW, height: s.h * charH, lineHeight: `${charH}px` }}
    />
  )
}

function textFieldOf(s: Shape): string | null {
  switch (s.type) {
    case 'text': return 'text'
    case 'button':
    case 'checkbox':
    case 'nav-bar':
    case 'card':
    case 'modal': return 'title' in s ? 'title' : 'label' in s ? 'label' : null
    case 'textfield': return 'value'
    case 'textarea': return 'value'
    default: return null
  }
}
```

Pick the right field per shape — map expanded:
```ts
// revised
function textFieldOf(s: Shape): string | null {
  switch (s.type) {
    case 'text': return 'text'
    case 'button': return 'label'
    case 'checkbox': return 'label'
    case 'textfield': return 'value'
    case 'textarea': return 'value'
    case 'card': return 'body'
    case 'modal': return 'body'
    case 'nav-bar': return 'title'
    case 'browser': return 'url'
    default: return null
  }
}
```

- [ ] **Step 2: Canvas — dblclick to enter edit**

In Canvas, add `onDoubleClick={(e) => { const c = toCell(e); const hit = doc.shapes.slice().reverse().find(s => c.x >= s.x && c.x < s.x + s.w && c.y >= s.y && c.y < s.y + s.h); if (hit) useEditor.getState().setInlineEdit(hit.id) }}` and mount `<InlineTextEditor charW={...} charH={...} />`.

- [ ] **Step 3: useClipboard for shapes**

```ts
'use client'
import { useEffect } from 'react'
import { useEditor } from '@/store/editor-store'
import { addShape, setSelection } from '@/model/doc-ops'
import { duplicateShape } from '@/model/shape-ops'
import { copyText } from '@/lib/clipboard'
import { render, toText } from '@/renderer'

let shapeBuffer: ReturnType<typeof JSON.stringify> | null = null

export function useClipboard() {
  useEffect(() => {
    const onKey = async (e: KeyboardEvent) => {
      const meta = e.metaKey || e.ctrlKey
      if (!meta) return
      const st = useEditor.getState()
      if (e.key.toLowerCase() === 'c') {
        if (st.doc.selection.length > 0) {
          const selected = st.doc.shapes.filter(s => st.doc.selection.includes(s.id))
          shapeBuffer = JSON.stringify(selected)
        } else {
          await copyText(toText(render(st.doc)))
        }
      }
      if (e.key.toLowerCase() === 'v' && shapeBuffer) {
        const arr = JSON.parse(shapeBuffer) as any[]
        let doc = st.doc
        const ids: string[] = []
        for (const raw of arr) {
          const s = duplicateShape(raw)
          ids.push(s.id)
          doc = addShape(doc, s)
        }
        st.applyDocChange(() => setSelection(doc, ids))
      }
      if (e.key.toLowerCase() === 'd' && st.doc.selection.length > 0) {
        e.preventDefault()
        let doc = st.doc
        const ids: string[] = []
        for (const raw of st.doc.shapes.filter(s => st.doc.selection.includes(s.id))) {
          const s = duplicateShape(raw)
          ids.push(s.id)
          doc = addShape(doc, s)
        }
        st.applyDocChange(() => setSelection(doc, ids))
      }
      if (e.key.toLowerCase() === 'a') {
        e.preventDefault()
        st.applyDocChange(d => setSelection(d, d.shapes.map(s => s.id)))
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])
}
```

Mount `useClipboard()` inside `Editor` alongside `useKeyboard()`.

- [ ] **Step 4: Commit**

```bash
git commit -am "feat(ui): inline text edit and shape clipboard (copy/paste/duplicate/select-all)"
```

---

## Phase 9 — E2E smoke + polish

### Task 36: Playwright E2E smoke

**Files:**
- Modify: `tests/e2e/home.spec.ts` → replace with `tests/e2e/draw-and-copy.spec.ts`

- [ ] **Step 1: Remove the placeholder and add a real smoke test**

```bash
rm tests/e2e/home.spec.ts
```

`tests/e2e/draw-and-copy.spec.ts`:
```ts
import { test, expect } from '@playwright/test'

test('draw a button and copy ASCII', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write'])
  await page.goto('/')
  await expect(page.getByRole('heading', { name: 'ASCII Mockups' })).toBeHidden() // name is input
  await page.getByRole('button', { name: /Button\b/ }).click() // palette button
  const canvasPre = page.locator('pre').first()
  const box = await canvasPre.boundingBox()
  if (!box) throw new Error('no canvas')
  // Template tool places at the clicked cell
  await page.mouse.click(box.x + 40, box.y + 40)
  await page.getByRole('button', { name: 'Copy ASCII' }).click()
  const text = await page.evaluate(() => navigator.clipboard.readText())
  expect(text).toMatch(/Button/)
})
```

- [ ] **Step 2: Run**

```bash
bun run test:e2e
```

Expected: PASS.

- [ ] **Step 3: Commit**

```bash
git commit -am "test(e2e): draw a button and verify clipboard contents"
```

---

### Task 37: Final polish pass

**Files:**
- Modify: `src/components/Editor.tsx`, `README.md` (create)

- [ ] **Step 1: Ensure responsive breakpoints**

In `Editor.tsx`, add Tailwind classes so at `<992px` the right pane hides and a toggle button appears; at `<640px` canvas goes read-only with a banner.

```tsx
<div className="lg:flex hidden">{/* right pane */}</div>
<div className="max-sm:absolute max-sm:inset-0 max-sm:flex max-sm:items-center max-sm:justify-center max-sm:bg-parchment/90">
  <p className="font-serif text-olive-gray">Open on desktop to edit.</p>
</div>
```

- [ ] **Step 2: Add README**

```md
# ASCII Mockups

A web-based ASCII-character mockup editor. Draw wireframes, copy the ASCII, paste anywhere.

## Development

- `bun install`
- `bun run dev` — start Next.js dev server at http://localhost:3000
- `bun run test` — Vitest watch
- `bun run test:e2e` — Playwright smoke
- `bun run build` — production build
```

- [ ] **Step 3: Run everything one last time**

```bash
bun run lint
bun run typecheck
bun run test:run
bun run test:e2e
```

All green. If coverage < 80% on `src/model` / `src/renderer` / `src/templates`, add missing tests before merging.

- [ ] **Step 4: Final commit**

```bash
git add README.md
git commit -am "chore: responsive polish and README"
```

---

## Done — what should be true

- A user can open `http://localhost:3000`, pick a tool or template, draw/place shapes, edit their properties, move/resize/delete/duplicate them, undo/redo, rename the mockup, copy ASCII to clipboard or download as `.txt`/`.png`, switch light/dark themes, resize the panes, and reload without losing work.
- All features from the spec are covered by the task list above.
- Unit coverage ≥ 80% on `src/model`, `src/renderer`, `src/templates`.
- Playwright smoke passes end-to-end.

---

## Self-review notes

**Spec coverage:** every v1 feature in the spec maps to a task — basic tools (Tasks 9–13), templates (14–20), undo/redo + coalescing (22), copy/paste/duplicate (35), nudging (27), autosave + multi-doc (31–32), export (33), grid-size (34), layer panel (29), alignment guides + multi-select foundations (34), light/dark (34), resizable panes (30), inline edit (35), responsive polish (37), E2E (36).

**Placeholder scan:** every code step carries concrete code. No TBDs, "implement later", or hand-waves.

**Type consistency:** `ToolId`/`ShapeType` defined in Task 4 is used consistently. Store method names (`applyDocChange`, `beginCoalesce`, `endCoalesce`, `openDocById`, `renameDoc`, `newDoc`, `deleteDocById`) are stable across all later tasks that reference them.

**Known small gaps filled:** marquee-select (drag-rect multi-select) is left implicit in Task 26 — if full marquee is desired, add an optional follow-up task extending `useTool.ts` with a `marquee` interaction kind mirroring `move`.
