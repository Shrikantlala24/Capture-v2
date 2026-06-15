import type { AnalysisResult } from './types'

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:8000'

export async function analyzeProblem(
  problem: string,
  mode: number,
  code?: string,
  userApproach?: string,
  userApiKey?: string,
): Promise<AnalysisResult> {
  const payload: {
    problem: string
    mode: number
    code?: string
    user_approach?: string
    user_api_key?: string
  } = {
    problem,
    mode,
  }

  if (code && code.trim()) {
    payload.code = code
  }
  if (userApproach && userApproach.trim()) {
    payload.user_approach = userApproach
  }
  if (userApiKey && userApiKey.trim()) {
    payload.user_api_key = userApiKey
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
