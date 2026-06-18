import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TagList from '@/components/TagList'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
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
    <div className="flex flex-col gap-10">
      <header className="flex flex-col gap-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">[+] local history</p>
            <h1 className="text-4xl font-semibold">Session archive</h1>
            <p className="max-w-2xl text-muted-foreground">
              Every successful analysis is saved in this browser so you can reopen
              a line of thinking without starting from zero.
            </p>
          </div>
          <Button variant="outline" onClick={handleClear} disabled={entries.length === 0}>
            Clear history
          </Button>
        </div>
        <Separator />
      </header>

      {entries.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>[x] no sessions yet</CardTitle>
            <CardDescription>
              Run a problem analysis and this page will become your local replay log.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link to="/analyze">Start analyzing</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-5">
          {entries.map((entry) => (
            <Card key={entry.id}>
              <CardHeader>
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="flex flex-col gap-2">
                    <CardTitle>{truncate(entry.problem, 88)}</CardTitle>
                    <CardDescription>{formatDate(entry.createdAt)}</CardDescription>
                  </div>
                  <Button asChild variant="outline">
                    <Link to={`/analyze?session=${entry.id}`}>Open session</Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <p className="text-sm leading-7 text-muted-foreground">
                  {truncate(entry.problem)}
                </p>
                <TagList tags={entry.result.tags} emptyLabel="No tags" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
