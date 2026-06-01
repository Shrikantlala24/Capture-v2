import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TagList from '../components/TagList'
import { analyzeProblem } from '../lib/api'
import { addHistoryEntry, getHistoryEntry } from '../lib/storage'
import type { AnalysisResult } from '../lib/types'

const approachOrder = [
  { key: 'brute', label: 'Brute force' },
  { key: 'better', label: 'Better' },
  { key: 'optimal', label: 'Optimal' },
] as const

const makeId = () => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export default function Analyze() {
  const [problem, setProblem] = useState('')
  const [code, setCode] = useState('')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const sessionId = searchParams.get('session')
    if (!sessionId) {
      return
    }
    const entry = getHistoryEntry(sessionId)
    if (entry) {
      setProblem(entry.problem)
      setCode(entry.code)
      setResult(entry.result)
      setStatus('success')
      setErrorMessage('')
    }
  }, [searchParams])

  const handleAnalyze = async () => {
    if (!problem.trim()) {
      setStatus('error')
      setErrorMessage('Please add a problem statement before analyzing.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const analysis = await analyzeProblem(problem.trim(), code.trim())
      setResult(analysis)
      setStatus('success')
      addHistoryEntry({
        id: makeId(),
        createdAt: new Date().toISOString(),
        problem: problem.trim(),
        code: code.trim(),
        result: analysis,
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Something went wrong. Please try again.',
      )
    }
  }

  const handleClear = () => {
    setProblem('')
    setCode('')
    setResult(null)
    setStatus('idle')
    setErrorMessage('')
  }

  const time = result?.complexity?.time
  const space = result?.complexity?.space
  const approachEntries = approachOrder.filter(
    (item) => result?.approaches?.[item.key],
  )

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Analyze</p>
        <h1 className="text-3xl sm:text-4xl">Break the problem down fast.</h1>
        <p className="text-mist">
          Paste the problem statement, add your code if you want diagnostics, and
          get a structured analysis in seconds.
        </p>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
          <label className="text-sm font-semibold">Problem statement</label>
          <textarea
            value={problem}
            onChange={(event) => setProblem(event.target.value)}
            placeholder="Paste the problem statement here."
            className="mt-3 min-h-[240px] w-full resize-y rounded-2xl border border-line bg-white/80 p-4 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
          <label className="text-sm font-semibold">Your code (optional)</label>
          <textarea
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Paste your solution attempt here."
            className="mt-3 min-h-[240px] w-full resize-y rounded-2xl border border-line bg-white/80 p-4 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-2 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
          disabled={status === 'loading'}
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              Analyzing
            </>
          ) : (
            'Analyze'
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-5 py-2 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow"
        >
          Clear inputs
        </button>

        {status === 'success' && (
          <span className="inline-flex items-center gap-2 text-sm text-mist">
            <CheckCircle2 size={16} /> Analysis ready.
          </span>
        )}
        {status === 'error' && (
          <span className="inline-flex items-center gap-2 text-sm text-accent">
            <AlertTriangle size={16} /> {errorMessage}
          </span>
        )}
      </div>

      {result && (
        <section className="space-y-8">
          <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h2 className="text-2xl">Concept tags</h2>
            <div className="mt-4">
              <TagList tags={result.tags} emptyLabel="No tags returned." />
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h2 className="text-2xl">Logic blocks</h2>
            {result.logic_blocks && result.logic_blocks.length > 0 ? (
              <ol className="mt-4 list-decimal space-y-3 pl-6 text-sm text-mist">
                {result.logic_blocks.map((step, index) => (
                  <li key={`${step}-${index}`}>{step}</li>
                ))}
              </ol>
            ) : (
              <p className="mt-3 text-sm text-mist">
                No logic blocks returned.
              </p>
            )}
          </div>

          <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h2 className="text-2xl">Error diagnosis</h2>
            {code.trim() ? (
              result.errors?.found ? (
                <div className="mt-4 space-y-4">
                  {result.errors.diagnosis?.map((item, index) => (
                    <div
                      key={`${item.type}-${index}`}
                      className="rounded-2xl border border-line bg-white/80 p-4"
                    >
                      <p className="text-sm font-semibold text-ink">
                        {item.type || 'Issue'}{' '}
                        {item.line != null ? `- Line ${item.line}` : ''}
                      </p>
                      <p className="mt-2 text-sm text-mist">
                        {item.explanation || 'No explanation provided.'}
                      </p>
                      {item.fix && (
                        <p className="mt-2 text-sm text-ink">Fix: {item.fix}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-mist">
                  No errors found in the provided code.
                </p>
              )
            ) : (
              <p className="mt-3 text-sm text-mist">
                Add code to unlock error diagnosis.
              </p>
            )}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
              <h2 className="text-2xl">Time complexity</h2>
              <div className="mt-4 space-y-2 text-sm text-mist">
                <p>Best: {time?.best || 'N/A'}</p>
                <p>Average: {time?.average || 'N/A'}</p>
                <p>Worst: {time?.worst || 'N/A'}</p>
                {time?.reason && <p>{time.reason}</p>}
              </div>
            </div>
            <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
              <h2 className="text-2xl">Space complexity</h2>
              <div className="mt-4 space-y-2 text-sm text-mist">
                <p>Value: {space?.value || 'N/A'}</p>
                {space?.reason && <p>{space.reason}</p>}
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
            <h2 className="text-2xl">Approach ladder</h2>
            <div className="mt-4 space-y-3">
              {approachEntries.length > 0 ? (
                approachEntries.map((item) => {
                  const data = result.approaches?.[item.key]
                  if (!data) {
                    return null
                  }
                  return (
                    <details
                      key={item.key}
                      className="rounded-2xl border border-line bg-white/80 p-4"
                    >
                      <summary className="cursor-pointer text-sm font-semibold text-ink">
                        {item.label}
                      </summary>
                      <div className="mt-3 space-y-2 text-sm text-mist">
                        <p>{data.description || 'No description provided.'}</p>
                        <p>Time: {data.time || 'N/A'}</p>
                        {data.technique && <p>Technique: {data.technique}</p>}
                        {data.key_insight && (
                          <p>Key insight: {data.key_insight}</p>
                        )}
                        {data.why_insufficient && (
                          <p>Why insufficient: {data.why_insufficient}</p>
                        )}
                      </div>
                    </details>
                  )
                })
              ) : (
                <p className="text-sm text-mist">No approaches returned.</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
