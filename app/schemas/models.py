from typing import List, Optional

from pydantic import BaseModel, Field


class ErrorItem(BaseModel):
    type: str = Field(description="Error type e.g. IndexError, LogicError, TLEError")
    line: Optional[int] = Field(description="Line number of the error, if identifiable")
    explanation: str = Field(description="Why this is an error")
    fix: str = Field(description="How to fix it")


class ErrorDiagnosis(BaseModel):
    found: bool = Field(description="Whether any errors were found in the code")
    diagnosis: List[ErrorItem] = Field(
        default_factory=list, description="List of errors found"
    )


class TimeComplexity(BaseModel):
    best: str
    average: str
    worst: str
    reason: str = Field(
        description="What operation or loop structure drives this complexity"
    )


class SpaceComplexity(BaseModel):
    value: str
    reason: str = Field(description="What data structure or recursion drives the space usage")


class Complexity(BaseModel):
    time: TimeComplexity
    space: SpaceComplexity


class Approach(BaseModel):
    description: str = Field(description="How this approach works")
    time: str = Field(description="Time complexity e.g. O(n^2)")
    key_insight: Optional[str] = Field(
        description="Core idea that makes this approach work"
    )
    why_insufficient: Optional[str] = Field(
        description="Why this approach is not optimal (for brute/better)"
    )
    technique: Optional[str] = Field(
        description="DSA technique used e.g. Monotonic Stack, Two Pointers"
    )


class Approaches(BaseModel):
    brute: Approach
    better: Approach
    optimal: Approach


class AnalysisResult(BaseModel):
    tags: List[str] = Field(
        description="DSA concept tags e.g. ['Sliding Window', 'HashMap']"
    )
    logic_blocks: List[str] = Field(
        description="Ordered reasoning steps to think through the problem"
    )
    errors: ErrorDiagnosis
    complexity: Complexity
    approaches: Approaches
