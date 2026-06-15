import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Cpu,
  Lightbulb,
  Loader2,
  Lock,
  Sparkles,
} from 'lucide-react'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TagList from '../components/TagList'
import { analyzeProblem } from '../lib/api'
import { addHistoryEntry, getHistoryEntry } from '../lib/storage'
import type { AnalysisResult } from '../lib/types'

const MODES = [
  {
    id: 1,
    label: '🔍 First time',
    description: "Guide me through it — I haven't seen this before.",
  },
  {
    id: 2,
    label: '🧱 I\'m stuck',
    description: "I know this problem but can't crack the solution.",
  },
  {
    id: 3,
    label: '⚡ Want better',
    description: 'I have a solution, show me more optimal approaches.',
  },
  {
    id: 4,
    label: '🧠 Intuition-first',
    description: 'Let me describe my approach, validate and improve it.',
  },
] as const

const approachOrder = [
  { key: 'brute', label: '🔨 Brute Force' },
  { key: 'better', label: '⚙️ Better' },
  { key: 'optimal', label: '🚀 Optimal' },
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
  const [userApproach, setUserApproach] = useState('')
  const [userApiKey, setUserApiKey] = useState('')
  const [mode, setMode] = useState<1 | 2 | 3 | 4>(1)

  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>(
    'idle',
  )
  const [errorMessage, setErrorMessage] = useState('')
  const [searchParams] = useSearchParams()

  // Track accordion state for approaches
  const [expandedApproaches, setExpandedApproaches] = useState<
    Record<string, boolean>
  >({
    brute: false,
    better: false,
    optimal: true, // Optimal expanded by default
  })

  // Track tab state for each approach
  const [activeTabs, setActiveTabs] = useState<
    Record<string, 'hint' | 'pseudocode' | 'keycode'>
  >({
    brute: 'hint',
    better: 'hint',
    optimal: 'hint',
  })

  // Collapsible API Key settings state
  const [showApiSettings, setShowApiSettings] = useState(false)

  useEffect(() => {
    const sessionId = searchParams.get('session')
    if (!sessionId) {
      return
    }
    const entry = getHistoryEntry(sessionId)
    if (entry) {
      setProblem(entry.problem)
      setCode(entry.code || '')
      setUserApproach(entry.userApproach || '')
      setMode((entry.mode as 1 | 2 | 3 | 4) || 1)
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
    if (mode === 4 && !userApproach.trim()) {
      setStatus('error')
      setErrorMessage('Please describe your intuition or approach for Mode 4.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const analysis = await analyzeProblem(
        problem.trim(),
        mode,
        code.trim() || undefined,
        mode === 4 ? userApproach.trim() : undefined,
        userApiKey.trim() || undefined,
      )

      setResult(analysis)
      setStatus('success')

      addHistoryEntry({
        id: makeId(),
        createdAt: new Date().toISOString(),
        problem: problem.trim(),
        code: code.trim() || undefined,
        mode,
        userApproach: mode === 4 ? userApproach.trim() : undefined,
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
    setUserApproach('')
    setResult(null)
    setStatus('idle')
    setErrorMessage('')
  }

  const toggleApproach = (key: string) => {
    setExpandedApproaches((prev) => ({
      ...prev,
      [key]: !prev[key],
    }))
  }

  const setApproachTab = (
    approachKey: string,
    tab: 'hint' | 'pseudocode' | 'keycode',
  ) => {
    setActiveTabs((prev) => ({
      ...prev,
      [approachKey]: tab,
    }))
  }

  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-xs uppercase tracking-[0.35em] text-mist">Analyze</p>
        <h1 className="text-4xl sm:text-5xl font-display leading-tight text-ink">
          Break the problem down fast.
        </h1>
        <p className="text-lg text-mist max-w-2xl text-pretty">
          Select your situation, paste the statement, and get a structured analysis
          to build clear intuition.
        </p>
      </header>

      {/* API Configuration Collapsible Card */}
      <section className="rounded-3xl border border-line bg-card/60 backdrop-blur shadow-soft p-5 transition-all">
        <button
          type="button"
          onClick={() => setShowApiSettings(!showApiSettings)}
          className="flex w-full items-center justify-between text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent rounded-lg py-1 px-2"
          aria-expanded={showApiSettings}
        >
          <div className="flex items-center gap-2">
            <Lock size={16} className="text-mist" aria-hidden="true" />
            <span className="text-sm font-semibold text-ink">🔑 API Configuration</span>
            {userApiKey ? (
              <span className="rounded-full bg-accent-2/10 px-2.5 py-0.5 text-xs font-semibold text-accent2">
                Custom Key Active
              </span>
            ) : (
              <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-xs font-semibold text-amber-700">
                Demo Keys Enabled
              </span>
            )}
          </div>
          {showApiSettings ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>
        {showApiSettings && (
          <div className="mt-4 border-t border-line/60 pt-4 space-y-4 animate-fade-up">
            <p className="text-xs text-mist leading-relaxed max-w-xl">
              Note: Default environment API keys are limited to 2 uses per session.
              For unlimited access, please provide your own Google AI Studio API key below.
              Your key is only saved in-memory and sent directly to the local API.
            </p>
            <div className="flex flex-col gap-1.5 max-w-md">
              <label htmlFor="apiKey" className="text-xs font-semibold text-ink">
                Your API Key (Optional)
              </label>
              <input
                id="apiKey"
                type="password"
                name="apiKey"
                value={userApiKey}
                onChange={(e) => setUserApiKey(e.target.value)}
                placeholder="AIzaSy…"
                spellCheck={false}
                autoComplete="off"
                className="w-full rounded-xl border border-line bg-white/90 px-3.5 py-2 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </div>
          </div>
        )}
      </section>

      {/* Mode Selector */}
      <section className="space-y-4">
        <h3 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist">
          What’s your situation with this problem?
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {MODES.map((item) => {
            const isSelected = mode === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setMode(item.id)}
                className={`relative flex flex-col items-start gap-2 rounded-2xl border p-5 text-left transition shadow-sm hover:shadow-soft focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                  isSelected
                    ? 'border-ink bg-ink text-sand'
                    : 'border-line bg-white/70 hover:bg-white text-ink'
                }`}
              >
                <span className="font-semibold text-sm sm:text-base">{item.label}</span>
                <span
                  className={`text-xs leading-relaxed ${
                    isSelected ? 'text-sand/80' : 'text-mist'
                  }`}
                >
                  {item.description}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Two-Column Inputs */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-2 rounded-3xl border border-line bg-card p-6 shadow-soft">
          <label htmlFor="problem" className="text-sm font-semibold text-ink">
            Problem statement
          </label>
          <textarea
            id="problem"
            name="problem"
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Paste the problem statement or type the name here…"
            className="min-h-[220px] w-full resize-y rounded-2xl border border-line bg-white/80 p-4 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>

        <div className="flex flex-col gap-2 rounded-3xl border border-line bg-card p-6 shadow-soft">
          {mode === 4 ? (
            <>
              <label htmlFor="userApproach" className="text-sm font-semibold text-ink">
                Your intuition / approach
              </label>
              <textarea
                id="userApproach"
                name="userApproach"
                value={userApproach}
                onChange={(e) => setUserApproach(e.target.value)}
                placeholder="Describe how you are thinking about solving this problem in plain text or pseudocode…"
                className="min-h-[220px] w-full resize-y rounded-2xl border border-line bg-white/80 p-4 text-sm text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </>
          ) : (
            <>
              <label htmlFor="code" className="text-sm font-semibold text-ink">
                Your code (optional)
              </label>
              <textarea
                id="code"
                name="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Paste your attempt here for error diagnosis…"
                spellCheck={false}
                className="min-h-[220px] w-full resize-y rounded-2xl border border-line bg-white/80 p-4 text-sm font-mono text-ink shadow-sm focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent"
              />
            </>
          )}
        </div>
      </section>

      {/* Run Trigger */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAnalyze}
          disabled={status === 'loading'}
          className="inline-flex items-center gap-2 rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-sand shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          {status === 'loading' ? (
            <>
              <Loader2 size={16} className="animate-spin" aria-hidden="true" />
              <span>Analyzing…</span>
            </>
          ) : (
            <>
              <span>Analyse →</span>
            </>
          )}
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="inline-flex items-center gap-2 rounded-full border border-line bg-white/80 px-6 py-2.5 text-sm font-semibold text-ink shadow-soft transition hover:-translate-y-0.5 hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer"
        >
          Clear inputs
        </button>

        {status === 'success' && (
          <span className="inline-flex items-center gap-2 text-sm text-accent-2 font-medium" aria-live="polite">
            <CheckCircle2 size={16} aria-hidden="true" /> Analysis ready.
          </span>
        )}
        {status === 'error' && (
          <span className="inline-flex items-center gap-2 text-sm text-accent font-medium" aria-live="polite">
            <AlertTriangle size={16} aria-hidden="true" /> {errorMessage}
          </span>
        )}
      </div>

      {result && (
        <section className="space-y-8 animate-fade-up">
          <div className="border-t border-line/80 my-8 pt-8" />

          {/* Intuition hook & Pattern name */}
          <div className="grid grid-cols-1 md:grid-cols-[1.5fr_1fr] gap-6">
            <div className="relative rounded-3xl border-l-4 border-violet-500 border-y border-r border-line bg-gradient-to-br from-violet-50/50 via-fuchsia-50/20 to-white p-6 shadow-soft flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white shadow-sm border border-line">
                <Lightbulb className="text-violet-600" size={22} aria-hidden="true" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-mist font-semibold">Intuition Hook</p>
                <p className="mt-1 text-base text-ink leading-relaxed font-medium">
                  {result.intuition_hook}
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-line bg-gradient-to-br from-emerald-50/30 to-white p-6 shadow-soft flex flex-col justify-between gap-4">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-mist font-semibold">Identified Pattern</p>
                <p className="mt-2 text-lg font-semibold text-ink flex items-center gap-2">
                  <Sparkles className="text-emerald-600 size-5" aria-hidden="true" />
                  <span>{result.pattern_name}</span>
                </p>
              </div>
              <div>
                <TagList tags={result.tags} emptyLabel="No tags" />
              </div>
            </div>
          </div>

          {/* 70/30 Split Results Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-10 gap-8 items-start">
            
            {/* Left Column (70%) - Approach Ladder */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-display text-ink flex items-center gap-2">
                  <Cpu size={22} className="text-mist" aria-hidden="true" />
                  <span>Approach Ladder</span>
                </h3>
                <span className="text-xs text-mist font-semibold uppercase tracking-wider bg-white border border-line px-2.5 py-1 rounded-full">
                  3 strategies
                </span>
              </div>

              <div className="flex flex-col gap-4">
                {approachOrder.map((item) => {
                  const data = result.approaches?.[item.key]
                  if (!data) return null

                  const isExpanded = expandedApproaches[item.key]
                  const activeTab = activeTabs[item.key] || 'hint'

                  return (
                    <article
                      key={item.key}
                      className={`rounded-3xl border shadow-soft transition-all duration-300 overflow-hidden ${
                        isExpanded
                          ? 'border-ink bg-white shadow-soft'
                          : 'border-line bg-card/70 hover:bg-white hover:border-mist'
                      }`}
                    >
                      {/* Accordion Trigger Header */}
                      <button
                        type="button"
                        onClick={() => toggleApproach(item.key)}
                        className="flex w-full items-center justify-between p-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                        aria-expanded={isExpanded}
                      >
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                          <span className="font-semibold text-base sm:text-lg text-ink">
                            {item.label}
                          </span>
                          <span className="rounded-full border border-line bg-sand/50 px-3 py-0.5 text-xs font-mono text-mist font-semibold">
                            {data.time}
                          </span>
                        </div>
                        {isExpanded ? (
                          <ChevronUp size={18} className="text-mist" aria-hidden="true" />
                        ) : (
                          <ChevronDown size={18} className="text-mist" aria-hidden="true" />
                        )}
                      </button>

                      {/* Accordion Body Content */}
                      {isExpanded && (
                        <div className="border-t border-line/60 p-5 space-y-5 animate-fade-up">
                          <div>
                            <p className="text-sm text-ink leading-relaxed">
                              {data.description}
                            </p>
                            {data.technique && (
                              <p className="mt-2.5 text-xs text-mist font-semibold">
                                Technique: <span className="text-ink font-medium">{data.technique}</span>
                              </p>
                            )}
                          </div>

                          {/* Custom Nested Tab Selector */}
                          <div className="space-y-4">
                            <div
                              role="tablist"
                              className="flex gap-1.5 border-b border-line pb-1"
                            >
                              {(['hint', 'pseudocode', 'keycode'] as const).map((tabKey) => {
                                const tabLabel = {
                                  hint: '💬 Hint & Insights',
                                  pseudocode: '📋 Pseudocode',
                                  keycode: '🔑 Key Code',
                                }[tabKey]
                                const isTabActive = activeTab === tabKey

                                return (
                                  <button
                                    key={tabKey}
                                    role="tab"
                                    type="button"
                                    aria-selected={isTabActive}
                                    onClick={() => setApproachTab(item.key, tabKey)}
                                    className={`px-3.5 py-1.5 text-xs font-semibold rounded-t-xl transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent cursor-pointer ${
                                      isTabActive
                                        ? 'bg-ink text-sand'
                                        : 'text-mist hover:bg-sand/60 hover:text-ink'
                                    }`}
                                  >
                                    {tabLabel}
                                  </button>
                                )
                              })}
                            </div>

                            {/* Tab Panels */}
                            <div className="min-h-[120px] transition-all">
                              {activeTab === 'hint' && (
                                <div className="space-y-3 animate-fade-up">
                                  {data.hint && (
                                    <div className="rounded-2xl bg-blue-50/60 border border-blue-100 p-4 text-sm text-blue-900 leading-relaxed">
                                      <p className="font-semibold text-xs text-blue-800 uppercase tracking-wider mb-1">
                                        Nudge
                                      </p>
                                      {data.hint}
                                    </div>
                                  )}

                                  {data.key_insight && (
                                    <div className="rounded-2xl bg-emerald-50/60 border border-emerald-100 p-4 text-sm text-emerald-900 leading-relaxed">
                                      <p className="font-semibold text-xs text-emerald-800 uppercase tracking-wider mb-1">
                                        Key Insight
                                      </p>
                                      💡 {data.key_insight}
                                    </div>
                                  )}

                                  {data.why_insufficient && item.key !== 'optimal' && (
                                    <div className="rounded-2xl bg-amber-50/60 border border-amber-100 p-4 text-sm text-amber-900 leading-relaxed">
                                      <p className="font-semibold text-xs text-amber-800 uppercase tracking-wider mb-1">
                                        Why insufficient
                                      </p>
                                      ⚠️ {data.why_insufficient}
                                    </div>
                                  )}
                                </div>
                              )}

                              {activeTab === 'pseudocode' && (
                                <div className="rounded-2xl border border-line bg-sand/30 p-4 font-mono text-xs text-ink leading-relaxed overflow-x-auto whitespace-pre animate-fade-up">
                                  {data.pseudocode.trim() ? (
                                    data.pseudocode
                                  ) : (
                                    <span className="text-mist">No pseudocode available.</span>
                                  )}
                                </div>
                              )}

                              {activeTab === 'keycode' && (
                                <div className="rounded-2xl border border-line bg-ink p-4 font-mono text-xs text-sand leading-relaxed overflow-x-auto whitespace-pre animate-fade-up">
                                  {data.key_code_block.trim() ? (
                                    data.key_code_block
                                  ) : (
                                    <span className="text-sand/50">No code block available.</span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                  )
                })}
              </div>
            </div>

            {/* Right Column (30%) - Sidebar Info Panel */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Complexity Card */}
              <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
                <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist border-b border-line/60 pb-3">
                  Complexity bounds
                </h4>
                <div className="mt-4 space-y-4">
                  <div>
                    <h5 className="text-xs font-semibold text-mist uppercase tracking-wide">Time Complexity</h5>
                    <div className="mt-2 divide-y divide-line/40 text-sm">
                      <div className="flex justify-between py-1.5 font-variant-numeric: tabular-nums">
                        <span className="text-mist">Best</span>
                        <code className="font-mono bg-sand/70 px-1.5 py-0.5 rounded text-ink text-xs">
                          {result.complexity?.time?.best || 'N/A'}
                        </code>
                      </div>
                      <div className="flex justify-between py-1.5 font-variant-numeric: tabular-nums">
                        <span className="text-mist">Average</span>
                        <code className="font-mono bg-sand/70 px-1.5 py-0.5 rounded text-ink text-xs">
                          {result.complexity?.time?.average || 'N/A'}
                        </code>
                      </div>
                      <div className="flex justify-between py-1.5 font-variant-numeric: tabular-nums">
                        <span className="text-mist">Worst</span>
                        <code className="font-mono bg-sand/70 px-1.5 py-0.5 rounded text-ink text-xs">
                          {result.complexity?.time?.worst || 'N/A'}
                        </code>
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-line/40 pt-3">
                    <h5 className="text-xs font-semibold text-mist uppercase tracking-wide">Space Complexity</h5>
                    <div className="mt-2 flex justify-between text-sm py-1 font-variant-numeric: tabular-nums">
                      <span className="text-mist">Auxiliary</span>
                      <code className="font-mono bg-sand/70 px-1.5 py-0.5 rounded text-ink text-xs">
                        {result.complexity?.space?.value || 'N/A'}
                      </code>
                    </div>
                  </div>
                </div>
              </div>

              {/* Error Diagnosis Card (if code statement entered) */}
              {(code.trim() || result.errors?.found) && (
                <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist border-b border-line/60 pb-3">
                    Error Diagnosis
                  </h4>
                  <div className="mt-4">
                    {result.errors?.found && result.errors.diagnosis?.length > 0 ? (
                      <div className="space-y-3">
                        {result.errors.diagnosis.map((err, i) => (
                          <div
                            key={i}
                            className="rounded-2xl border border-line/80 bg-white p-3.5 space-y-2 text-xs"
                          >
                            <p className="font-bold text-accent uppercase tracking-wide flex items-center gap-1.5">
                              <AlertTriangle size={14} aria-hidden="true" />
                              <span>
                                {err.type} {err.line != null ? `(Line ${err.line})` : ''}
                              </span>
                            </p>
                            <p className="text-ink leading-relaxed font-medium">
                              {err.explanation}
                            </p>
                            <div className="rounded-lg bg-sand/40 border border-line/40 p-2 font-mono text-ink">
                              <span className="font-semibold text-mist">Fix:</span> {err.fix}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-2xl bg-emerald-50/40 border border-emerald-100 p-4 text-center">
                        <CheckCircle2 size={24} className="text-emerald-600 mx-auto" aria-hidden="true" />
                        <p className="mt-2 text-sm font-semibold text-emerald-950">Clean Attempt</p>
                        <p className="text-xs text-emerald-800/80 mt-1">
                          No errors found in the submitted logic attempt.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Keep Going Card */}
              {result.similar_problems && result.similar_problems.length > 0 && (
                <div className="rounded-3xl border border-line bg-card p-6 shadow-soft">
                  <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-mist border-b border-line/60 pb-3">
                    Keep Going
                  </h4>
                  <div className="mt-4 space-y-3.5">
                    {result.similar_problems.map((prob, index) => {
                      const diffColor =
                        {
                          easy: 'bg-emerald-50 text-emerald-800 border-emerald-100',
                          medium: 'bg-amber-50 text-amber-800 border-amber-100',
                          hard: 'bg-red-50 text-red-800 border-red-100',
                        }[prob.difficulty.toLowerCase()] ||
                        'bg-sand text-mist border-line'

                      return (
                        <div
                          key={index}
                          className="rounded-2xl border border-line/60 bg-white/70 p-4 shadow-sm flex flex-col gap-2 transition hover:bg-white"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-semibold text-sm text-ink leading-tight">
                              {prob.title}
                            </span>
                            <span
                              className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider shrink-0 ${diffColor}`}
                            >
                              {prob.difficulty}
                            </span>
                          </div>
                          <span className="text-xs text-mist leading-relaxed">
                            Pattern: <span className="font-medium text-ink">{prob.pattern}</span>
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

            </div>
          </div>
        </section>
      )}
    </div>
  )
}
