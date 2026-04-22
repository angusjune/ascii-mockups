'use client'
import { useEffect, useState } from 'react'
import { load, save } from '@/lib/local-storage'

type Theme = 'light' | 'dark'

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => {
    const t = load<{ theme: Theme }>('ascii-mockups:prefs')?.theme ?? 'light'
    setTheme(t)
    document.documentElement.dataset.theme = t
  }, [])
  const toggle = () => {
    const t: Theme = theme === 'light' ? 'dark' : 'light'
    setTheme(t)
    document.documentElement.dataset.theme = t
    save('ascii-mockups:prefs', { theme: t })
  }
  return (
    <button
      onClick={toggle}
      className="rounded-[8px] bg-warm-sand px-3 py-1.5 text-sm text-charcoal-warm ring-1 ring-ring-warm"
      aria-label="Toggle theme"
    >
      {theme === 'light' ? '☾' : '☀'}
    </button>
  )
}
