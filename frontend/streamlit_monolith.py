import html
import sys
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.chains.analyser import run_analysis

load_dotenv()

# ── Page config ──────────────────────────────────────────────────────────────
st.set_page_config(page_title="Capture · DSA Analyser", layout="wide")

st.markdown("""
<style>
@import url('https://fonts.googleapis.com/css2?family=Fraunces:wght@400;700&family=Manrope:wght@400;600&display=swap');

html, body, [class*="css"] { font-family: 'Manrope', sans-serif; }
h1, h2, h3 { font-family: 'Fraunces', serif; letter-spacing: -0.02em; }

.tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin: 0.5rem 0; }
.tag-chip {
    background: #eef2ff; color: #1e3a8a;
    padding: 0.2rem 0.75rem; border-radius: 999px;
    font-size: 0.8rem; border: 1px solid #c7d2fe;
    font-family: 'Manrope', sans-serif;
}
.hook-box {
    background: linear-gradient(135deg, #fdf4ff, #eff6ff);
    border-left: 4px solid #7c3aed;
    border-radius: 0 12px 12px 0;
    padding: 1rem 1.25rem; margin: 0.75rem 0;
    font-size: 1.05rem; color: #1d1b18;
}
.pattern-box {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 0.6rem 1rem;
    font-size: 0.9rem; color: #166534;
    display: inline-block; margin-bottom: 0.5rem;
}
.mode-card {
    border: 2px solid #e5e7eb; border-radius: 14px;
    padding: 1rem; cursor: pointer; transition: all 0.2s;
    background: white;
}
.mode-card:hover { border-color: #7c3aed; }
.similar-card {
    background: #fafafa; border: 1px solid #e5e7eb;
    border-radius: 10px; padding: 0.75rem 1rem; margin: 0.4rem 0;
}
.diff-easy { color: #16a34a; font-weight: 600; }
.diff-medium { color: #d97706; font-weight: 600; }
.diff-hard { color: #dc2626; font-weight: 600; }
.stExpander { border-radius: 10px !important; }
</style>
""", unsafe_allow_html=True)

# ── Header ────────────────────────────────────────────────────────────────────
st.markdown("## Capture · DSA Analyser")
st.caption("Break problems down. Build intuition. Move forward.")
st.divider()

# ── Mode selector ─────────────────────────────────────────────────────────────
MODES = {
    1: ("🔍 First time", "Guide me through it — I haven't seen this before."),
    2: ("🧱 I'm stuck", "I know this problem but can't crack the solution."),
    3: ("⚡ Want better", "I have a solution, show me more optimal approaches."),
    4: ("🧠 Intuition-first", "Let me describe my approach, validate and improve it."),
}

st.markdown("### What's your situation with this problem?")
cols = st.columns(4)
selected_mode = st.session_state.get("mode", 1)

for i, (mode_id, (label, desc)) in enumerate(MODES.items()):
    with cols[i]:
        if st.button(
            f"{label}",
            key=f"mode_{mode_id}",
            use_container_width=True,
            type="primary" if selected_mode == mode_id else "secondary",
            help=desc,
        ):
            st.session_state["mode"] = mode_id
            st.rerun()

selected_mode = st.session_state.get("mode", 1)
_, mode_desc = MODES[selected_mode]
st.caption(f"**Mode {selected_mode}:** {mode_desc}")
st.divider()

# ── Inputs ────────────────────────────────────────────────────────────────────
col_left, col_right = st.columns(2)

with col_left:
    problem = st.text_area(
        "Problem statement",
        height=220,
        placeholder="Paste the problem statement or just write the problem name...",
        key="problem_input",
    )

with col_right:
    if selected_mode == 4:
        user_approach = st.text_area(
            "Your intuition / approach",
            height=220,
            placeholder="Describe how you're thinking about solving this...",
            key="user_approach_input",
        )
        code = ""
    else:
        code = st.text_area(
            "Your code (optional)",
            height=220,
            placeholder="Paste your attempt here for error diagnosis...",
            key="code_input",
        )
        user_approach = ""

# ── Run button ────────────────────────────────────────────────────────────────
run_col, clear_col, _ = st.columns([1, 1, 5])
with run_col:
    run = st.button("Analyse →", type="primary", use_container_width=True)
with clear_col:
    if st.button("Clear", use_container_width=True):
        for k in ["result", "problem_input", "code_input", "user_approach_input"]:
            st.session_state.pop(k, None)
        st.rerun()

# ── Analysis ──────────────────────────────────────────────────────────────────
if run:
    if not problem.strip():
        st.error("Please enter a problem statement.")
    elif selected_mode == 4 and not user_approach.strip():
        st.error("Please describe your intuition/approach for Mode 4.")
    else:
        with st.spinner("Analysing..."):
            try:
                result = run_analysis(
                    problem=problem.strip(),
                    mode=selected_mode,
                    code=code.strip() if code.strip() else None,
                    user_approach=user_approach.strip() if user_approach.strip() else None,
                )
                st.session_state["result"] = result
                st.session_state["last_problem"] = problem.strip()
                st.session_state["last_code"] = code.strip()
            except Exception as e:
                st.error(f"Analysis failed: {e}")

# ── Results ───────────────────────────────────────────────────────────────────
result = st.session_state.get("result")

if result:
    st.divider()

    # Intuition hook + pattern
    hook = getattr(result, "intuition_hook", None)
    pattern = getattr(result, "pattern_name", None)

    if hook:
        st.markdown(f'<div class="hook-box">💡 {html.escape(hook)}</div>', unsafe_allow_html=True)
    if pattern:
        st.markdown(f'<div class="pattern-box">🏷️ Pattern: <strong>{html.escape(pattern)}</strong></div>', unsafe_allow_html=True)

    # Tags
    tags = getattr(result, "tags", [])
    if tags:
        chips = "".join(f'<span class="tag-chip">{html.escape(t)}</span>' for t in tags)
        st.markdown(f'<div class="tag-row">{chips}</div>', unsafe_allow_html=True)

    st.divider()

    # ── Approach ladder ───────────────────────────────────────────────────────
    st.markdown("### Approach Ladder")
    approaches = getattr(result, "approaches", None)

    approach_order = [
        ("brute", "🔨 Brute Force"),
        ("better", "⚙️ Better"),
        ("optimal", "🚀 Optimal"),
    ]

    # For mode 3 collapse brute by default
    default_open = {
        1: ["brute", "better", "optimal"],
        2: ["brute", "better", "optimal"],
        3: ["better", "optimal"],
        4: ["brute", "better", "optimal"],
    }[selected_mode]

    if approaches:
        for key, label in approach_order:
            data = getattr(approaches, key, None)
            if not data:
                continue

            with st.expander(f"{label}  ·  `{getattr(data, 'time', 'N/A')}`", expanded=(key in default_open)):
                st.write(getattr(data, "description", ""))

                technique = getattr(data, "technique", None)
                if technique:
                    st.caption(f"Technique: **{technique}**")

                # Progressive toggles
                t1, t2, t3 = st.tabs(["💬 Hint", "📋 Pseudocode", "🔑 Key Code"])

                with t1:
                    hint = getattr(data, "hint", None)
                    if hint:
                        st.info(hint)
                    insight = getattr(data, "key_insight", None)
                    if insight:
                        st.success(f"Aha: {insight}")
                    why = getattr(data, "why_insufficient", None)
                    if why and key != "optimal":
                        st.warning(f"Why not enough: {why}")

                with t2:
                    pseudo = getattr(data, "pseudocode", None)
                    if pseudo:
                        st.code(pseudo, language=None)
                    else:
                        st.caption("No pseudocode available.")

                with t3:
                    key_code = getattr(data, "key_code_block", None)
                    if key_code:
                        st.code(key_code)
                        st.caption("Core logic only — no boilerplate.")
                    else:
                        st.caption("No code block available.")

    st.divider()

    # ── Complexity ────────────────────────────────────────────────────────────
    complexity = getattr(result, "complexity", None)
    if complexity:
        st.markdown("### Complexity")
        c1, c2 = st.columns(2)
        time = getattr(complexity, "time", None)
        space = getattr(complexity, "space", None)
        with c1:
            st.markdown("**Time**")
            if time:
                st.write(f"Best: `{getattr(time, 'best', 'N/A')}`")
                st.write(f"Average: `{getattr(time, 'average', 'N/A')}`")
                st.write(f"Worst: `{getattr(time, 'worst', 'N/A')}`")
        with c2:
            st.markdown("**Space**")
            if space:
                st.write(f"Value: `{getattr(space, 'value', 'N/A')}`")

    # ── Error diagnosis ───────────────────────────────────────────────────────
    last_code = st.session_state.get("last_code", "")
    errors = getattr(result, "errors", None)
    if last_code and errors:
        st.divider()
        st.markdown("### Error Diagnosis")
        if getattr(errors, "found", False):
            for item in getattr(errors, "diagnosis", []):
                line = getattr(item, "line", None)
                label = f"Line {line}" if line else "?"
                st.warning(f"**{getattr(item, 'type', 'Error')}** ({label})")
                st.write(getattr(item, "explanation", ""))
                st.code(getattr(item, "fix", ""), language=None)
        else:
            st.success("No errors found in your code.")

    # ── Similar problems ──────────────────────────────────────────────────────
    similar = getattr(result, "similar_problems", [])
    if similar:
        st.divider()
        st.markdown("### Keep Going — Similar Problems")
        for prob in similar:
            diff = getattr(prob, "difficulty", "").lower()
            diff_class = f"diff-{diff}" if diff in ("easy", "medium", "hard") else ""
            pat = getattr(prob, "pattern", "")
            title = getattr(prob, "title", "")
            st.markdown(
                f'<div class="similar-card">'
                f'<strong>{html.escape(title)}</strong> &nbsp;'
                f'<span class="{diff_class}">{html.escape(getattr(prob, "difficulty", ""))}</span><br/>'
                f'<small style="color:#6b7280">Pattern: {html.escape(pat)}</small>'
                f'</div>',
                unsafe_allow_html=True,
            )