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
