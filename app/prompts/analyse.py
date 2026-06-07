from langchain_core.prompts import ChatPromptTemplate

_SYSTEM_BASE = """
You are an expert DSA mentor. Return ONLY valid JSON matching the schema.
No explanation outside JSON.

{format_instructions}
"""

_APPROACH_INSTRUCTIONS = """
For each approach (brute, better, optimal):
- description: how it works
- time: complexity e.g. O(n^2)
- hint: a nudge that triggers thinking WITHOUT giving away the solution
- pseudocode: clean step-by-step, no language syntax
- key_code_block: ONLY the core logic block (the main loop/recursion/key operation), no imports, no main(), no boilerplate
- key_insight: the aha moment
- why_insufficient: why this isn't optimal (brute/better only)
- technique: DSA pattern used
"""

# Mode 1: First Discovery — full guided journey
MODE_1_NO_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}

User is seeing this problem FOR THE FIRST TIME.

Return:
- intuition_hook: what is this problem REALLY asking (1-2 lines, trigger their thinking)
- pattern_name: explicit pattern label
- tags: DSA topics
- errors: found=false, diagnosis=[]
- complexity: of optimal solution
- approaches: brute→better→optimal with hints gated (hint should be minimal, just a nudge)
- similar_problems: 3 problems same pattern, increasing difficulty

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

# Mode 2: Knows problem, stuck on solution
MODE_2_NO_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}

User KNOWS this problem but is STUCK on the solution.

Return:
- intuition_hook: reframe the problem to unlock their thinking
- pattern_name: explicit pattern
- tags: DSA topics
- errors: found=false, diagnosis=[]
- complexity: of optimal
- approaches: focus hints on WHY each step fails, what to try next
- similar_problems: 3 problems, same pattern

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

# Mode 3: Knows solution, wants better approaches
MODE_3_NO_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}

User KNOWS the solution, wants BETTER approaches.

Return:
- intuition_hook: what optimization insight unlocks the better approaches
- pattern_name: pattern of the optimal
- tags: DSA topics
- errors: found=false, diagnosis=[]
- complexity: show contrast between approaches
- approaches: brute can be brief, focus depth on better+optimal
- similar_problems: 3 harder problems, same pattern

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

# Mode 4: Intuition-first — user describes their approach
MODE_4_NO_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}
User's intuition/approach: {user_approach}

User is solving RAW from intuition. Validate their thinking first.

Return:
- intuition_hook: acknowledge what's RIGHT about their approach, then reframe
- pattern_name: pattern their intuition is closest to
- tags: DSA topics
- errors: found=false, diagnosis=[]
- complexity: of their approach vs optimal
- approaches: brute = their approach (validate it), better/optimal = where to go next
- similar_problems: 3 problems to build on their intuition

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

# With code variants
MODE_1_WITH_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}
Code: ```{code}```

User is seeing this FIRST TIME but has written code.

Return everything from mode 1 PLUS full error diagnosis.
- errors: diagnose their code thoroughly

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

MODE_2_WITH_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}
Code: ```{code}```

User KNOWS the problem, stuck, has attempted code.

Return mode 2 analysis PLUS:
- errors: show exactly where their attempt breaks and why

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

MODE_3_WITH_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}
Code: ```{code}```

User has a working solution, wants optimization.

Return mode 3 analysis PLUS:
- errors: flag any inefficiencies or edge cases in their current code

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

MODE_4_WITH_CODE = ChatPromptTemplate.from_messages([
    ("system", _SYSTEM_BASE),
    ("human", """
Problem: {problem}
{dataset_context}
User's intuition: {user_approach}
Code: ```{code}```

User solved raw from intuition and has code.

Return mode 4 analysis PLUS:
- errors: validate their code against their intuition, show gaps

{_APPROACH_INSTRUCTIONS}
""".replace("{_APPROACH_INSTRUCTIONS}", _APPROACH_INSTRUCTIONS))
])

PROMPT_MAP = {
    (1, False): MODE_1_NO_CODE,
    (2, False): MODE_2_NO_CODE,
    (3, False): MODE_3_NO_CODE,
    (4, False): MODE_4_NO_CODE,
    (1, True): MODE_1_WITH_CODE,
    (2, True): MODE_2_WITH_CODE,
    (3, True): MODE_3_WITH_CODE,
    (4, True): MODE_4_WITH_CODE,
}