export type ApproachDetails = {
  description: string
  time: string
  hint: string
  pseudocode: string
  key_code_block: string
  key_insight?: string
  why_insufficient?: string
  technique?: string
}

export type SimilarProblem = {
  title: string
  difficulty: string
  pattern: string
}

export type ErrorItem = {
  type: string
  line?: number | null
  explanation: string
  fix: string
}

export type ErrorDiagnosis = {
  found: boolean
  diagnosis: ErrorItem[]
}

export type TimeComplexity = {
  best: string
  average: string
  worst: string
}

export type SpaceComplexity = {
  value: string
}

export type Complexity = {
  time: TimeComplexity
  space: SpaceComplexity
}

export type Approaches = {
  brute: ApproachDetails
  better: ApproachDetails
  optimal: ApproachDetails
}

export type AnalysisResult = {
  intuition_hook: string
  pattern_name: string
  tags: string[]
  errors: ErrorDiagnosis
  complexity: Complexity
  approaches: Approaches
  similar_problems: SimilarProblem[]
}

export type HistoryEntry = {
  id: string
  createdAt: string
  problem: string
  code?: string
  mode?: number
  userApproach?: string
  result: AnalysisResult
}
