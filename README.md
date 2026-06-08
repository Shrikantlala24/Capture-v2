Now I have a thorough picture of the entire codebase. Here is the comprehensive summary:

---

## 1. What Is This Project About?

**Capture** (formerly branded as **DSA Analyser**) is a developer tool that takes a **Data Structures & Algorithms (DSA) problem statement** (and an optional user-submitted code attempt) and returns a **structured AI-powered analysis**. The analysis includes:

- **Concept tags** -- the DSA domains the problem belongs to (e.g., "Sliding Window", "HashMap", "Two Pointers")
- **Logic blocks** -- ordered, step-by-step reasoning for how to approach the problem (no code, just thinking)
- **Error diagnosis** -- if the user provides code, the tool identifies errors (type, line number, explanation, and fix suggestion)
- **Time and space complexity** for the optimal solution, with reasons
- **Three-tier approach ladder** -- Brute Force, Better, and Optimal approaches, each with descriptions, complexity, key insights, and why a less optimal approach falls short

The core workflow: a user pastes a problem statement (and optionally their code), clicks "Analyze," and the system sends it to **Google Gemini** via **LangChain**, which returns a structured JSON response that is rendered in the UI.

---

## 2. Tech Stack

### Backend (Python)
| Technology | Purpose |
|---|---|
| **FastAPI** | REST API framework -- serves the `/analyse` endpoint |
| **Uvicorn** | ASGI server to run FastAPI |
| **LangChain** (`langchain`, `langchain-google-genai`) | LLM orchestration -- prompt templates, chain composition (LCEL), output parsing |
| **Google Gemini** (`langchain-google-genai`) | The LLM that generates the actual analysis (model: `gemini-2.5-flash` by default) |
| **Pydantic** | Data validation and schema definition for request/response models; also the `PydanticOutputParser` that enforces structured JSON output from the LLM |
| **python-dotenv** | Loads environment variables (`.env`) |
| **httpx** | HTTP client used by the Streamlit frontend to call the FastAPI backend |

### Frontend Options (Three Choices)

**Option A -- Streamlit (API mode)**: `frontend/streamlit_app.py`
- **Streamlit** -- Python-based UI framework
- **httpx** -- calls the FastAPI backend over HTTP
- A standalone frontend that communicates with the FastAPI server

**Option B -- Streamlit (Monolith mode)**: `frontend/streamlit_monolith.py`
- Same Streamlit framework but imports `run_analysis` directly from the `app` package (no HTTP call, no separate API server needed)

**Option C -- React/Vite (modern SPA)**: `web/`
- **React 19** + **TypeScript 6** -- component-based UI
- **Vite 8** -- build tool and dev server
- **React Router DOM 7** -- client-side routing (Landing, Analyze, History)
- **TailwindCSS 4** -- utility-first CSS framework
- **Lucide React** -- icon library
- **shadcn** (listed in root `package.json` as a devDep) -- UI component library
- **localStorage** -- browser-based session history (no backend DB)

### Infrastructure / Dev Tooling
- **Dev Container** (`.devcontainer/`) -- Codespaces-ready Python 3.11 environment that auto-runs the Streamlit monolith on port 8501
- **GitHub Copilot instructions** -- requests automatic context7 docs fetching
- **GitHub Skills** (`.github/skills/chart-create/`) -- a skill definition for auto-generating Mermaid flowcharts

---

## 3. Directory Structure and Main Components

```
D:\WORK FROM HOME\Github 2\Projects\Capture-v2\
│
├── app/                              # Python backend package
│   ├── __init__.py                   # (empty)
│   ├── main.py                       # FastAPI app entry point + /analyse endpoint
│   ├── chains/
│   │   ├── __init__.py               # (empty)
│   │   └── analyser.py               # Core LLM chain: LangChain + Gemini + PydanticOutputParser
│   ├── prompts/
│   │   ├── __init__.py               # (empty)
│   │   └── analyse.py                # Two ChatPromptTemplates (with_code / without_code)
│   ├── schemas/
│   │   ├── __init__.py               # (empty)
│   │   └── models.py                 # Pydantic models: AnalysisResult, ErrorItem, Complexity, Approaches, etc.
│   └── db/                           # Empty (future database placeholder)
│
├── frontend/                         # Streamlit-based UIs
│   ├── streamlit_app.py              # Streamlit UI using httpx to call FastAPI
│   └── streamlit_monolith.py         # Streamlit UI importing app.analyser directly (no separate server)
│
├── web/                              # React/Vite modern SPA frontend
│   ├── index.html                    # HTML entry point
│   ├── vite.config.ts                # Vite config (Tailwind, React, Babel/React Compiler)
│   ├── tailwind.config.js            # Tailwind config
│   ├── tsconfig.json                 # TypeScript config
│   ├── package.json                  # React 19, Vite 8, Tailwind 4, React Router, Lucide
│   └── src/
│       ├── main.tsx                  # React mount point with BrowserRouter
│       ├── App.tsx                   # Top-level layout with header/nav/footer + Routes
│       ├── index.css                 # Global styles (Tailwind imports, custom CSS vars, animations)
│       ├── pages/
│       │   ├── Landing.tsx           # Landing / marketing page
│       │   ├── Analyze.tsx           # Main analysis page (input form + results display)
│       │   └── History.tsx           # Browser localStorage session history viewer
│       ├── components/
│       │   └── TagList.tsx           # Reusable tag/pill display component
│       └── lib/
│           ├── api.ts                # Fetch wrapper to call FastAPI /analyse
│           ├── storage.ts            # localStorage CRUD for history entries (up to 50)
│           └── types.ts              # TypeScript type definitions mirroring Pydantic schemas
│
├── docs/
│   ├── prompts.md                    # Full documentation of prompts design and chain assembly
│   ├── reflex.md                     # Notes about Reflex framework
│   ├── PR.md                         # PR-related documentation
│   └── *.pdf                         # Screenshot captures of logic traces
│
├── flowchart.md                      # Three Mermaid flowcharts documenting the system
├── .env                              # Environment vars: GOOGLE_API_KEY, MODEL_NAME, FASTAPI_HOST
├── requirements.txt                  # Python dependencies: fastapi, uvicorn, streamlit, langchain, etc.
├── package.json                      # Root: shadcn devDep
├── .devcontainer/
│   └── devcontainer.json             # Codespaces config: Python 3.11, auto-runs streamlit_monolith
├── .github/
│   ├── copilot-instructions.md       # Copilot instructions for context7
│   └── skills/chart-create/SKILL.md  # GitHub Skill for generating Mermaid flowcharts
└── .vscode/
    └── mcp.json                      # VSCode MCP configuration
```

---

## 4. Entry Points and Main Workflow

### Backend Entry Point (API Mode)

**File**: `app/main.py`

1. `load_dotenv()` loads environment variables (especially `GOOGLE_API_KEY` and `MODEL_NAME`).
2. A FastAPI app is created with CORS middleware (allowing the React SPA on `localhost:5173`).
3. A single POST endpoint `/analyse` is defined:
   - Accepts `AnalyseRequest` = `{ problem: str, code?: str }`
   - Validates that a non-empty problem was provided (HTTP 400 if missing)
   - Calls `run_analysis(problem, code)` from `app/chains/analyser.py`
   - Returns an `AnalysisResult` Pydantic model (automatically serialized to JSON)
   - Catches exceptions and returns HTTP 500

**File**: `app/chains/analyser.py`

1. Loads env vars.
2. Creates a `PydanticOutputParser` bound to the `AnalysisResult` schema.
3. `get_chain(has_code)` selects between two prompt templates (`ANALYSE_NO_CODE` vs `ANALYSE_WITH_CODE`) based on whether the user provided code.
4. Builds a LangChain LCEL chain: `prompt | llm (Gemini) | parser` -- this is a pipe-based RunnableSequence.
5. The LLM is `ChatGoogleGenerativeAI` with `temperature=0.2` (low temp for deterministic structured output).
6. `run_analysis(problem, code)` invokes the chain and returns the parsed `AnalysisResult`.

**File**: `app/prompts/analyse.py`

Contains two `ChatPromptTemplate` instances:
- `ANALYSE_NO_CODE` -- for problem-only analysis (skips error diagnosis)
- `ANALYSE_WITH_CODE` -- for problem + code analysis (includes error diagnosis)

Both use `system` + `human` message pairs, instructing Gemini to return strictly valid JSON.

**File**: `app/schemas/models.py`

Defines the complete output schema as Pydantic models:
- `ErrorItem`, `ErrorDiagnosis`
- `TimeComplexity`, `SpaceComplexity`, `Complexity`
- `Approach`, `Approaches`
- `AnalysisResult` (the top-level model with `tags`, `logic_blocks`, `errors`, `complexity`, `approaches`)

### Frontend Entry Points

**Streamlit (API mode)** -- `frontend/streamlit_app.py`:
- Run with `streamlit run frontend/streamlit_app.py`
- Uses `httpx` to POST to the FastAPI `/analyse` endpoint
- Renders results with expander panels and custom CSS tag chips

**Streamlit (Monolith mode)** -- `frontend/streamlit_monolith.py`:
- Run with `streamlit run frontend/streamlit_monolith.py`
- Imports `run_analysis` directly (no HTTP, no separate server)
- Same UI as API mode but calls the chain in-process

**React SPA** -- `web/src/main.tsx`:
- Run with `npm run dev` (Vite dev server on port 5173)
- Entry: `main.tsx` mounts `<App />` inside `<BrowserRouter>`
- Routes:
  - `/` -- Landing page (marketing + how-it-works)
  - `/analyze` -- Main analysis form + results display; calls FastAPI `/analyse` via `fetch`
  - `/history` -- Reads/writes `localStorage` for past sessions (up to 50 entries), with links to reopen old analyses
- Results are auto-saved to `localStorage` after each successful analysis

### End-to-End Flow

```
User opens UI (React SPA or Streamlit)
  --> Enters problem statement + optional code
  --> Clicks "Analyze"
  --> UI POSTs JSON to FastAPI /analyse
  --> FastAPI validates input
  --> run_analysis() selects prompt template, invokes LangChain chain
  --> Prompt + Pydantic format_instructions --> Gemini LLM (temperature=0.2)
  --> Gemini returns structured JSON
  --> PydanticOutputParser validates and coerces into AnalysisResult
  --> FastAPI returns JSON response
  --> UI renders tags, logic blocks, errors, complexity, and approach ladder
  --> (React SPA) Result saved to localStorage for history
```

### How to Run

1. **Set up `.env`** with `GOOGLE_API_KEY` and `MODEL_NAME`
2. **API mode**: `uvicorn app.main:app --reload` + `streamlit run frontend/streamlit_app.py` (or launch the React SPA with `npm run dev` inside `web/`)
3. **Monolith mode**: `streamlit run frontend/streamlit_monolith.py` (no separate API server needed)
4. **Dev Container**: Auto-installs deps and starts the monolith on port 8501
