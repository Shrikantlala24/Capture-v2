
# DSA Analyser

DSA Analyser is a developer tool that takes a DSA problem (and optional code)
and returns a structured analysis with concept tags, logic blocks, error diagnosis,
complexity, and approaches from brute force to optimal.

## Stack
- FastAPI (API)
- Streamlit (UI)
- LangChain + Gemini via langchain-google-genai

## Project structure
```
.
├── app/
│   ├── main.py
│   ├── chains/
│   │   └── analyser.py
│   ├── schemas/
│   │   └── models.py
│   └── prompts/
│       └── analyse.py
├── frontend/
│   └── streamlit_app.py
├── .env
├── requirements.txt
└── README.md
```

## Setup
1. Create and activate a virtual environment.
	- Windows: `python -m venv .venv` then `\.venv\Scripts\Activate.ps1`
	- macOS/Linux: `python -m venv .venv` then `source .venv/bin/activate`
2. Install dependencies: `pip install -r requirements.txt`
3. Update `.env` with your `GOOGLE_API_KEY`.

## Run
1. Start the API:
	- `uvicorn app.main:app --reload`
2. Start the UI in a second terminal:
	- `streamlit run frontend/streamlit_app.py`

If you run the API on a different host or port, update `FASTAPI_HOST` in `.env`.
