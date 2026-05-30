from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from app.chains.analyser import run_analysis
from app.schemas.models import AnalysisResult

load_dotenv()

app = FastAPI(title="DSA Analyser")


class AnalyseRequest(BaseModel):
    problem: str = Field(..., min_length=1)
    code: Optional[str] = None


@app.post("/analyse", response_model=AnalysisResult)
def analyse(request: AnalyseRequest) -> AnalysisResult:
    if not request.problem.strip():
        raise HTTPException(status_code=400, detail="Problem statement is required.")
    try:
        return run_analysis(problem=request.problem, code=request.code)
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))
