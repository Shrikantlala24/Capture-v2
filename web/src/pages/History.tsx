import { CalendarClock, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TagList from '../components/TagList'
import { clearHistory, loadHistory } from '../lib/storage'
import type { HistoryEntry } from '../lib/types'

const truncate = (value: string, limit = 160) => {
  const clean = value.trim().replace(/\s+/g, ' ')
  if (!clean) {
    return 'Untitled session'
  }
  if (clean.length <= limit) {
    return clean
  }
  return `${clean.slice(0, limit).trim()}...`
}

const formatDate = (value: string) => {
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) {
    return value
  }
  return parsed.toLocaleString()
}

export default function History() {
  const [entries, setEntries] = useState<HistoryEntry[]>([])

  useEffect(() => {
    setEntries(loadHistory())
  }, [])

  const handleClear = () => {
    clearHistory()
    setEntries([])
  }

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-mist">History</p>
          <h1 className="text-3xl sm:text-4xl">Session history</h1>
          <p className="text-mist">
            Every analysis you run is stored locally in your browser.
          </p>
        </div>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-60"
          disabled={entries.length === 0}
        >
          <Trash2 size={16} /> Clear history
        </button>
      </header>

      {entries.length === 0 ? (
        <div className="rounded-3xl border border-line bg-card p-8 text-center shadow-soft">
          <p className="text-lg">No sessions yet.</p>
          <p className="mt-2 text-sm text-mist">
            Run an analysis to build your history.
          </p>
          <Link
            to="/analyze"
            className="mt-5 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
          >
            Start analyzing
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {entries.map((entry) => (
            <div
              key={entry.id}
              className="rounded-3xl border border-line bg-card p-6 shadow-soft"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-lg font-semibold">
                    {truncate(entry.problem, 72)}
                  </p>
                  <div className="mt-2 inline-flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-mist">
                    <CalendarClock size={14} /> {formatDate(entry.createdAt)}
                  </div>
                </div>
                <Link
                  to={`/analyze?session=${entry.id}`}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-4 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
                >
                  Open session
                </Link>
              </div>

              <p className="mt-4 text-sm text-mist">
                {truncate(entry.problem)}
              </p>

              <div className="mt-4">
                <TagList tags={entry.result.tags} emptyLabel="No tags" />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
