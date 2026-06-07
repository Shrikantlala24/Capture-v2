from typing import Optional, Literal
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.chains.analyser import run_analysis
from app.schemas.models import AnalysisResult

load_dotenv()

app = FastAPI(title="Capture DSA Analyser v2")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:8501"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyseRequest(BaseModel):
    problem: str = Field(..., min_length=1)
    mode: Literal[1, 2, 3, 4] = Field(1, description="1=First time, 2=Stuck, 3=Want better, 4=Intuition-first")
    code: Optional[str] = None
    user_approach: Optional[str] = None  # mode 4 only


@app.post("/analyse", response_model=AnalysisResult)
def analyse(req: AnalyseRequest) -> AnalysisResult:
    if not req.problem.strip():
        raise HTTPException(status_code=400, detail="Problem statement required.")
    if req.mode == 4 and not req.user_approach:
        raise HTTPException(status_code=400, detail="user_approach required for mode 4.")
    try:
        return run_analysis(
            problem=req.problem,
            mode=req.mode,
            code=req.code,
            user_approach=req.user_approach,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0"}