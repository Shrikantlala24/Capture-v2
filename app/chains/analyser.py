import os
from typing import Optional

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import PydanticOutputParser

from app.prompts.analyse import ANALYSE_NO_CODE, ANALYSE_WITH_CODE
from app.schemas.models import AnalysisResult

load_dotenv()

parser = PydanticOutputParser(pydantic_object=AnalysisResult)


def _require_api_key() -> str:
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not set.")
    return api_key


def get_chain(has_code: bool):
    template = ANALYSE_WITH_CODE if has_code else ANALYSE_NO_CODE
    prompt = template.partial(format_instructions=parser.get_format_instructions())

    llm = ChatGoogleGenerativeAI(
        model=os.getenv("MODEL_NAME", "gemini-1.5-flash"),
        google_api_key=_require_api_key(),
        temperature=0.2,
    )

    return prompt | llm | parser


def run_analysis(problem: str, code: Optional[str] = None) -> AnalysisResult:
    has_code = code is not None and code.strip() != ""
    chain = get_chain(has_code)
    inputs = {"problem": problem}
    if has_code:
        inputs["code"] = code
    return chain.invoke(inputs)
