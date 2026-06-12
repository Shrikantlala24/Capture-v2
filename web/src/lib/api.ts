import type { AnalysisResult } from './types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function analyzeProblem(
  problem: string,
  code?: string,
): Promise<AnalysisResult> {
  const payload: { problem: string; code?: string } = { problem }
  if (code && code.trim()) {
    payload.code = code
  }

  const response = await fetch(`${API_BASE}/analyse`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const text = await response.text()
    throw new Error(`API error: ${response.status} ${text}`)
  }

  return response.json()
}
