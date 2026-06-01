import type { HistoryEntry } from './types'

const STORAGE_KEY = 'capture.history.v1'

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') {
    return []
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      return []
    }
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) {
      return []
    }
    return parsed as HistoryEntry[]
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]) {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries))
}

export function addHistoryEntry(entry: HistoryEntry) {
  const existing = loadHistory()
  const next = [entry, ...existing].slice(0, 50)
  saveHistory(next)
  return next
}

export function clearHistory() {
  if (typeof window === 'undefined') {
    return
  }
  localStorage.removeItem(STORAGE_KEY)
}

export function getHistoryEntry(id: string) {
  return loadHistory().find((entry) => entry.id === id)
}
