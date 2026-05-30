from langchain_core.prompts import ChatPromptTemplate

ANALYSE_NO_CODE = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert DSA mentor and competitive programmer.
Your job is to analyse a given DSA problem and return a structured breakdown.

You must return your response STRICTLY as valid JSON matching the schema below.
Do not add any explanation outside the JSON.

{format_instructions}
"""),
    ("human", """
Problem Statement:
{problem}

Analyse this problem and return:
1. Concept tags (DSA topics this problem belongs to)
2. Logic blocks (step-by-step reasoning to approach this problem - NOT code, just thinking)
3. No error diagnosis needed (no code provided)
4. Time and space complexity of the optimal solution with reasons
5. Three approaches: Brute Force -> Better -> Optimal
   For each: description, time complexity, and key insight or why the previous is insufficient
""")
])

ANALYSE_WITH_CODE = ChatPromptTemplate.from_messages([
    ("system", """
You are an expert DSA mentor, competitive programmer, and code reviewer.
Your job is to analyse a DSA problem AND the user's code attempt.

You must return your response STRICTLY as valid JSON matching the schema below.
Do not add any explanation outside the JSON.

{format_instructions}
"""),
    ("human", """
Problem Statement:
{problem}

User's Code:
```
{code}
```

Analyse this and return:
1. Concept tags (DSA topics this problem belongs to)
2. Logic blocks (step-by-step reasoning - NOT code, just thinking process)
3. Error diagnosis of the provided code:
   - If errors exist: for each error return type, line number, explanation, and fix
   - If no errors: set found=false and diagnosis=[]
4. Time and space complexity of the optimal solution with reasons
5. Three approaches: Brute Force -> Better -> Optimal
   For each: description, time complexity, and key insight or why the previous is insufficient
""")
])
