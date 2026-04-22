export function load<T>(key: string): T | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function save<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / access errors — ignore
  }
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
