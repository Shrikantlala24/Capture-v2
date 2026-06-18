import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import TagList from '@/components/TagList'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { analyzeProblem } from '../lib/api'
import { addHistoryEntry, getHistoryEntry } from '../lib/storage'
import type { AnalysisResult } from '../lib/types'

const MODES = [
  {
    id: '1',
    label: 'first time',
    summary: 'I need the cleanest first-pass breakdown.',
  },
  {
    id: '2',
    label: 'stuck',
    summary: 'I know the shape but cannot unlock it.',
  },
  {
    id: '3',
    label: 'want better',
    summary: 'I have something working and want the sharper route.',
  },
  {
    id: '4',
    label: 'intuition-first',
    summary: 'Validate and refine the way I am already thinking.',
  },
] as const

const APPROACHES = [
  { key: 'brute', label: '[+] brute force' },
  { key: 'better', label: '[+] better' },
  { key: 'optimal', label: '[+] optimal' },
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
  const [mode, setMode] = useState<'1' | '2' | '3' | '4'>('1')
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')
  const [searchParams] = useSearchParams()
  const [activePanels, setActivePanels] = useState<Record<string, 'hint' | 'pseudocode' | 'keycode'>>({
    brute: 'hint',
    better: 'hint',
    optimal: 'hint',
  })

  useEffect(() => {
    const sessionId = searchParams.get('session')
    if (!sessionId) {
      return
    }

    const entry = getHistoryEntry(sessionId)
    if (!entry) {
      return
    }

    setProblem(entry.problem)
    setCode(entry.code || '')
    setUserApproach(entry.userApproach || '')
    setMode(String(entry.mode || 1) as '1' | '2' | '3' | '4')
    setResult(entry.result)
    setStatus('success')
    setErrorMessage('')
  }, [searchParams])

  const handleAnalyze = async () => {
    if (!problem.trim()) {
      setStatus('error')
      setErrorMessage('Problem statement required.')
      return
    }

    if (mode === '4' && !userApproach.trim()) {
      setStatus('error')
      setErrorMessage('Mode 4 needs your current intuition or rough approach.')
      return
    }

    setStatus('loading')
    setErrorMessage('')

    try {
      const analysis = await analyzeProblem(
        problem.trim(),
        Number(mode),
        code.trim() || undefined,
        mode === '4' ? userApproach.trim() : undefined,
        userApiKey.trim() || undefined,
      )

      setResult(analysis)
      setStatus('success')

      addHistoryEntry({
        id: makeId(),
        createdAt: new Date().toISOString(),
        problem: problem.trim(),
        code: code.trim() || undefined,
        mode: Number(mode),
        userApproach: mode === '4' ? userApproach.trim() : undefined,
        result: analysis,
      })
    } catch (error) {
      setStatus('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Something went wrong. Please try again.',
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

  return (
    <div className="flex flex-col gap-10">
      <header className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <div className="flex flex-col gap-4">
          <p className="text-sm text-muted-foreground">[+] analysis workspace</p>
          <h1 className="text-5xl font-semibold">Run one focused reasoning pass.</h1>
          <p className="max-w-3xl text-muted-foreground">
            Choose the context you are in, drop the prompt in, and let the result
            stay legible: pattern, tradeoffs, hints, pseudocode, key code, and
            similar practice problems.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>[+] API configuration</CardTitle>
            <CardDescription>
              Demo keys may be limited. Add your own Google AI Studio key for personal use.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Input
              type="password"
              value={userApiKey}
              onChange={(event) => setUserApiKey(event.target.value)}
              placeholder="AIzaSy…"
              autoComplete="off"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>[+] choose your mode</CardTitle>
          <CardDescription>
            The backend prompt changes based on what kind of help you want.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <ToggleGroup
            value={[mode]}
            onValueChange={(value) => {
              if (value[0]) {
                setMode(value[0] as '1' | '2' | '3' | '4')
              }
            }}
            className="flex w-full flex-col gap-2 md:grid md:grid-cols-2 xl:grid-cols-4"
          >
            {MODES.map((item) => (
              <ToggleGroupItem
                key={item.id}
                value={item.id}
                variant="outline"
                className="h-auto w-full justify-start px-3 py-3 text-left"
              >
                <span className="flex flex-col gap-1">
                  <span>[+] {item.label}</span>
                  <span className="text-xs text-muted-foreground">{item.summary}</span>
                </span>
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </CardContent>
      </Card>

      <section className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>[+] input / problem statement</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={problem}
              onChange={(event) => setProblem(event.target.value)}
              placeholder="Paste the problem statement or just the problem name."
              className="min-h-72"
              spellCheck={false}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              {mode === '4' ? '[+] input / your intuition' : '[+] input / your code'}
            </CardTitle>
            <CardDescription>
              {mode === '4'
                ? 'Describe the mental model you are trying, even if it feels incomplete.'
                : 'Optional, but useful if you want error diagnosis or inefficiency notes.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={mode === '4' ? userApproach : code}
              onChange={(event) =>
                mode === '4'
                  ? setUserApproach(event.target.value)
                  : setCode(event.target.value)
              }
              placeholder={
                mode === '4'
                  ? 'Explain your current intuition in plain language or pseudocode.'
                  : 'Paste your code attempt.'
              }
              className="min-h-72"
              spellCheck={false}
            />
          </CardContent>
        </Card>
      </section>

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleAnalyze} disabled={status === 'loading'}>
          {status === 'loading' ? 'Analyzing…' : 'Analyze'}
        </Button>
        <Button variant="outline" onClick={handleClear} disabled={status === 'loading'}>
          Clear
        </Button>
      </div>

      {status === 'error' && (
        <Alert variant="destructive">
          <AlertTitle>[x] request failed</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {status === 'success' && result && (
        <div className="flex flex-col gap-8">
          <Separator />

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
            <Card>
              <CardHeader>
                <CardTitle>[+] intuition hook</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-base leading-7">{result.intuition_hook}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge>[+] pattern</Badge>
                  <span className="text-sm text-muted-foreground">{result.pattern_name}</span>
                </div>
                <TagList tags={result.tags} emptyLabel="No tags returned" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>[+] complexity</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 text-sm">
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <span className="text-muted-foreground">best</span>
                  <code>{result.complexity.time.best}</code>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <span className="text-muted-foreground">average</span>
                  <code>{result.complexity.time.average}</code>
                </div>
                <div className="flex items-center justify-between gap-4 border-b border-border pb-3">
                  <span className="text-muted-foreground">worst</span>
                  <code>{result.complexity.time.worst}</code>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">space</span>
                  <code>{result.complexity.space.value}</code>
                </div>
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,0.75fr)]">
            <div className="flex flex-col gap-5">
              {APPROACHES.map((item) => {
                const data = result.approaches[item.key]
                const activePanel = activePanels[item.key]

                return (
                  <Card key={item.key}>
                    <CardHeader>
                      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex flex-col gap-2">
                          <CardTitle>{item.label}</CardTitle>
                          <CardDescription>{data.description}</CardDescription>
                        </div>
                        <Badge variant="outline">{data.time}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-5">
                      <ToggleGroup
                        value={[activePanel]}
                        onValueChange={(value) => {
                          if (value[0]) {
                            setActivePanels((current) => ({
                              ...current,
                              [item.key]: value[0] as 'hint' | 'pseudocode' | 'keycode',
                            }))
                          }
                        }}
                        className="flex flex-wrap gap-2"
                      >
                        <ToggleGroupItem value="hint" variant="outline">
                          hint
                        </ToggleGroupItem>
                        <ToggleGroupItem value="pseudocode" variant="outline">
                          pseudocode
                        </ToggleGroupItem>
                        <ToggleGroupItem value="keycode" variant="outline">
                          key code
                        </ToggleGroupItem>
                      </ToggleGroup>

                      {activePanel === 'hint' && (
                        <div className="flex flex-col gap-3 text-sm leading-7">
                          <p>{data.hint}</p>
                          {data.key_insight ? (
                            <p className="text-muted-foreground">[+] insight: {data.key_insight}</p>
                          ) : null}
                          {data.technique ? (
                            <p className="text-muted-foreground">[+] technique: {data.technique}</p>
                          ) : null}
                          {data.why_insufficient && item.key !== 'optimal' ? (
                            <p className="text-muted-foreground">
                              [x] why it falls short: {data.why_insufficient}
                            </p>
                          ) : null}
                        </div>
                      )}

                      {activePanel === 'pseudocode' && (
                        <pre className="overflow-x-auto rounded-sm border border-border bg-muted px-4 py-3 text-sm leading-7 whitespace-pre-wrap">
                          {data.pseudocode}
                        </pre>
                      )}

                      {activePanel === 'keycode' && (
                        <pre className="overflow-x-auto rounded-sm border border-border bg-primary px-4 py-3 text-sm leading-7 whitespace-pre-wrap text-primary-foreground">
                          {data.key_code_block}
                        </pre>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="flex flex-col gap-5">
              {(code.trim() || result.errors.found) && (
                <Card>
                  <CardHeader>
                    <CardTitle>[+] error diagnosis</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-4">
                    {result.errors.found && result.errors.diagnosis.length > 0 ? (
                      result.errors.diagnosis.map((error, index) => (
                        <div key={`${error.type}-${index}`} className="rounded-sm border border-border bg-muted px-4 py-3">
                          <p className="font-medium">
                            [x] {error.type} {error.line != null ? `(line ${error.line})` : ''}
                          </p>
                          <p className="mt-2 text-sm leading-7 text-muted-foreground">
                            {error.explanation}
                          </p>
                          <p className="mt-2 text-sm leading-7">fix: {error.fix}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        [+] No concrete issues were flagged in the submitted attempt.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}

              {result.similar_problems.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>[+] similar problems</CardTitle>
                    <CardDescription>Use these to reinforce the same pattern family.</CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    {result.similar_problems.map((problemItem) => (
                      <div
                        key={`${problemItem.title}-${problemItem.difficulty}`}
                        className="rounded-sm border border-border px-4 py-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-medium">{problemItem.title}</p>
                          <Badge variant="outline">{problemItem.difficulty}</Badge>
                        </div>
                        <p className="mt-2 text-sm text-muted-foreground">
                          pattern: {problemItem.pattern}
                        </p>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
