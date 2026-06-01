export type ApproachDetails = {
  description?: string
  time?: string
  technique?: string
  key_insight?: string
  why_insufficient?: string
}

export type AnalysisResult = {
  tags?: string[]
  logic_blocks?: string[]
  errors?: {
    found?: boolean
    diagnosis?: Array<{
      line?: number | null
      type?: string
      explanation?: string
      fix?: string
    }>
  }
  complexity?: {
    time?: {
      best?: string
      average?: string
      worst?: string
      reason?: string
    }
    space?: {
      value?: string
      reason?: string
    }
  }
  approaches?: {
    brute?: ApproachDetails
    better?: ApproachDetails
    optimal?: ApproachDetails
  }
}

export type HistoryEntry = {
  id: string
  createdAt: string
  problem: string
  code: string
  result: AnalysisResult
}
