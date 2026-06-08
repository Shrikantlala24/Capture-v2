from typing import List, Optional, Literal
from pydantic import BaseModel, Field


class ErrorItem(BaseModel):
    type: str
    line: Optional[int] = None
    explanation: str
    fix: str


class ErrorDiagnosis(BaseModel):
    found: bool
    diagnosis: List[ErrorItem] = Field(default_factory=list)


class TimeComplexity(BaseModel):
    best: str
    average: str
    worst: str


class SpaceComplexity(BaseModel):
    value: str


class Complexity(BaseModel):
    time: TimeComplexity
    space: SpaceComplexity


class Approach(BaseModel):
    description: str
    time: str
    hint: str = Field(description="A nudge toward the approach without giving it away")
    pseudocode: str = Field(description="Step-by-step pseudocode, no language syntax")
    key_code_block: str = Field(description="Core logic only, no boilerplate")
    key_insight: Optional[str] = None
    why_insufficient: Optional[str] = None
    technique: Optional[str] = None


class Approaches(BaseModel):
    brute: Approach
    better: Approach
    optimal: Approach


class SimilarProblem(BaseModel):
    title: str
    difficulty: str
    pattern: str


class AnalysisResult(BaseModel):
    intuition_hook: str = Field(description="1-2 lines: what this problem really wants")
    pattern_name: str = Field(description="e.g. 'Sliding Window disguised as substring search'")
    tags: List[str]
    errors: ErrorDiagnosis
    complexity: Complexity
    approaches: Approaches
    similar_problems: List[SimilarProblem] = Field(default_factory=list)