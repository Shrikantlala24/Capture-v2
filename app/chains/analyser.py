import os
from typing import Optional, Literal
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser

from app.prompts.analyse import PROMPT_MAP
from app.schemas.models import AnalysisResult, SimilarProblem
from app.db.problems import build_dataset_context

load_dotenv()

parser = PydanticOutputParser(pydantic_object=AnalysisResult)


def _llm():
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    return ChatGoogleGenerativeAI(
        model=os.getenv("MODEL_NAME", "gemini-1.5-flash"),
        google_api_key=api_key,
        temperature=0.2,
    )


def run_analysis(
    problem: str,
    mode: Literal[1, 2, 3, 4] = 1,
    code: Optional[str] = None,
    user_approach: Optional[str] = None,
) -> AnalysisResult:
    has_code = bool(code and code.strip())
    prompt = PROMPT_MAP[(mode, has_code)]

    dataset_context, db_similar = build_dataset_context(problem)

    inputs = {
        "problem": problem,
        "dataset_context": dataset_context,
        "format_instructions": parser.get_format_instructions(),
    }
    if has_code:
        inputs["code"] = code
    if mode == 4:
        inputs["user_approach"] = user_approach or ""

    chain = prompt.partial(**{k: v for k, v in inputs.items() if k != "problem"}) | _llm() | parser
    result: AnalysisResult = chain.invoke({"problem": problem})

    # Enrich similar problems from DB if LLM didn't return enough
    if db_similar and len(result.similar_problems) < 3:
        for s in db_similar:
            result.similar_problems.append(
                SimilarProblem(
                    title=s["title"],
                    difficulty=s["difficulty"],
                    pattern=s["pattern"],
                )
            )

    return result