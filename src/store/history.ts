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
