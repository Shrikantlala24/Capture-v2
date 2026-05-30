# DSA Analyser Flowcharts

This document captures three views of the application workflow.


## 1) User Interaction Workflow

This shows the end-user path from input to rendered analysis results.

```mermaid
flowchart TD

    A[User opens Streamlit UI]
    A --> B["Enter problem statement <br>and optional code"]

    B --> C{Click Analyse?}

    C -- No --> B

    C -- Yes --> D[Validate problem <br>statement]

    D -- Invalid --> E[Show error: Please provide a <br>problem statement]

    D -- Valid --> F[Send POST request to <br>/analyse endpoint]

    F --> G{HTTP Response}

    G -- 200 OK --> H[Render tags, logic blocks, <br>errors, complexity and <br>approaches]

    G -- Error --> I[Show API or <br>connectivity error]

    F -. Uses FASTAPI_HOST .-> J[(.env)]
```


## 2) High-Level System Design

This highlights the main components and the request/response flow across the system.

```mermaid
flowchart LR

    subgraph Client
        UI[Streamlit UI]
    end

    subgraph API Layer
        API[FastAPI /analyse]
        Chain[LangChain Pipeline]
        Parser[Pydantic Output Parser]
    end

    subgraph LLM Layer
        Gemini[Google Gemini via langchain-google-genai]
    end

    UI -->|HTTP JSON| API

    API --> Chain

    Chain --> Gemini

    Gemini --> Parser

    Parser --> API

    API -->|JSON Response| UI

    ENV[(.env)]

    ENV --> UI

    ENV --> API

    ENV --> Chain
```


## 3) Low-Level Services Usage Design

This details the internal service steps inside the API and analysis pipeline.

```mermaid
flowchart TD

    A[User clicks Analyse button]

    A --> B[httpx.post to /analyse]

    B --> C[FastAPI endpoint /analyse]

    C --> D[Validate problem statement]

    D -- Missing --> E[Return HTTP 400]

    D -- Valid --> F[run_analysis problem and code]

    F --> G[get_chain has_code]

    G --> H[Select appropriate prompt template]

    H --> I[Inject format instructions]

    I --> J[Create ChatGoogleGenerativeAI instance]

    J --> K[Prompt to LLM to PydanticOutputParser]

    K --> L[Gemini generates response]

    L --> M[Parse into AnalysisResult]

    M --> N[Return JSON response]

    J -. Reads GOOGLE_API_KEY and MODEL_NAME .-> O[(.env)]

    C -. Loads env vars via python-dotenv .-> O
```