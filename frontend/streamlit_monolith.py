import html
import sys
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

# Ensure the project root is on sys.path when running via Streamlit.
ROOT_DIR = Path(__file__).resolve().parents[1]
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

from app.chains.analyser import run_analysis

load_dotenv()

st.set_page_config(page_title="DSA Analyser", layout="wide")

st.title("Capture: DSA Analyser")
st.markdown(
    "Paste a problem statement and (optionally) your code to get a structured analysis."
)

st.markdown(
    """
<style>
.tag-row { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 0.5rem; }
.tag-chip {
    background: #eef2ff;
    color: #1e3a8a;
    padding: 0.2rem 0.6rem;
    border-radius: 999px;
    font-size: 0.85rem;
    border: 1px solid #c7d2fe;
}
</style>
""",
    unsafe_allow_html=True,
)

problem = st.text_area(
    "Problem statement",
    height=200,
    placeholder="Paste the problem statement here.",
)
code = st.text_area(
    "Your code (optional)",
    height=200,
    placeholder="Paste your solution attempt here.",
)


def _to_dict(result):
    if hasattr(result, "model_dump"):
        return result.model_dump()
    return result.dict()


if st.button("Analyse", type="primary"):
    if not problem.strip():
        st.error("Please provide a problem statement.")
    else:
        with st.spinner("Analyzing..."):
            try:
                result_data = _to_dict(
                    run_analysis(
                        problem=problem,
                        code=code if code.strip() else None,
                    )
                )
            except Exception as exc:
                st.error(f"Analysis failed: {exc}")
                result_data = None

        if result_data:
            st.subheader("Concept Tags")

            def render_tags(tags):
                if not tags:
                    st.write("No tags returned.")
                    return
                chips = "".join(
                    f"<span class='tag-chip'>{html.escape(tag)}</span>"
                    for tag in tags
                )
                st.markdown(
                    f"<div class='tag-row'>{chips}</div>", unsafe_allow_html=True
                )

            render_tags(result_data.get("tags", []))

            st.subheader("Logic Blocks")
            for idx, step in enumerate(result_data.get("logic_blocks", []), start=1):
                st.markdown(f"{idx}. {step}")

            if code.strip():
                st.subheader("Error Diagnosis")
                errors = result_data.get("errors", {})
                if errors.get("found"):
                    for item in errors.get("diagnosis", []):
                        line = item.get("line")
                        line_label = (
                            f"Line {line}" if line is not None else "Line not specified"
                        )
                        st.warning(f"{item.get('type', 'Error')} ({line_label})")
                        st.write(item.get("explanation", ""))
                        st.write(f"Fix: {item.get('fix', '')}")
                else:
                    st.success("No errors found in the provided code.")

            st.subheader("Complexity")
            time = result_data.get("complexity", {}).get("time", {})
            space = result_data.get("complexity", {}).get("space", {})

            col1, col2 = st.columns(2)
            with col1:
                st.markdown("**Time**")
                st.write(f"Best: {time.get('best', 'N/A')}")
                st.write(f"Average: {time.get('average', 'N/A')}")
                st.write(f"Worst: {time.get('worst', 'N/A')}")
                st.write(time.get("reason", ""))
            with col2:
                st.markdown("**Space**")
                st.write(f"Value: {space.get('value', 'N/A')}")
                st.write(space.get("reason", ""))

            st.subheader("Approaches")
            approaches = result_data.get("approaches", {})
            approach_order = [
                ("Brute Force", "brute"),
                ("Better", "better"),
                ("Optimal", "optimal"),
            ]

            for title, key in approach_order:
                data = approaches.get(key, {})
                with st.expander(title, expanded=(key == "optimal")):
                    st.write(data.get("description", ""))
                    st.write(f"Time: {data.get('time', 'N/A')}")
                    if data.get("technique"):
                        st.write(f"Technique: {data.get('technique')}")
                    if data.get("key_insight"):
                        st.write(f"Key insight: {data.get('key_insight')}")
                    if data.get("why_insufficient"):
                        st.write(f"Why insufficient: {data.get('why_insufficient')}")
