import os
from typing import Optional, Literal
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser

from app.prompts.analyse import PROMPT_MAP
from app.schemas.models import AnalysisResult, SimilarProblem
from app.db.problems import build_dataset_context
from app.llm_manager import LLMManager # Import the LLMManager

load_dotenv()

parser = PydanticOutputParser(pydantic_object=AnalysisResult)

# Initialize LLMManager globally for simplicity. Consider a dependency injection for larger apps.
llm_manager = LLMManager()

def _llm(model_name: str, api_key: str):
    return ChatGoogleGenerativeAI(
        model=model_name,
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

    # Construct the full prompt text to estimate tokens
    full_prompt_text = prompt.format(**{k: v for k, v in inputs.items() if k != "problem" and v is not None}) + problem # A basic estimation

    # Get model from manager, assuming 1 token per 4 characters for a very rough estimate
    # A more accurate token estimation would require a proper tokenization library
    requested_tokens_estimate = len(full_prompt_text) // 4 + 50 # Add a buffer
    model_info = llm_manager.get_model(requested_tokens=requested_tokens_estimate)
    if not model_info:
        raise RuntimeError("No LLM model available within current rate limits.")

    selected_model_name = model_info["name"]
    selected_api_key = model_info["api_key"]

    # Fallback to GOOGLE_API_KEY if the model-specific API key is not set or is a placeholder
    if not selected_api_key or "YOUR_GEMINI" in selected_api_key:
        selected_api_key = os.getenv("GOOGLE_API_KEY")
        if not selected_api_key:
            raise ValueError("GOOGLE_API_KEY is not set, and no specific API key found for selected model.")

    llm_instance = _llm(selected_model_name, selected_api_key)

    chain = prompt.partial(**{k: v for k, v in inputs.items() if k != "problem"}) | llm_instance | parser
    result: AnalysisResult = chain.invoke({"problem": problem})

    # After successful invocation, update usage.
    # For a more precise token count, you'd need to extract tokens from the actual LLM response if available.
    llm_manager.update_usage(selected_model_name, tokens_used=len(str(result)) // 4 + 50) # Estimate response tokens too


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
