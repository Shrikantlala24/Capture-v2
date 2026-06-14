import html
import sys
from pathlib import Path

import streamlit as st
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent

if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

def get_analysis_service():
    from app.chains.analyser import run_analysis
    return  run_analysis

# from trial_package.trial_file import hello_world

# hello_world()

load_dotenv()

# setup Streamlit page config

st.set_page_config(page_title="Capture - trial code")

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
    font-size: 1.05rem; 
    /* Use a color that contrasts with both light/dark backgrounds */
    color: #2d2a26; 
}
.pattern-box {
    background: #f0fdf4; border: 1px solid #bbf7d0;
    border-radius: 10px; padding: 0.6rem 1rem;
    font-size: 0.9rem; 
    /* Use a color that contrasts with both light/dark backgrounds */
    color: #166534;
    display: inline-block; margin-bottom: 0.5rem;
}
.similar-card {
    background-color: #f3f4f6; 
    border: 1px solid #d1d5db;
    border-radius: 10px; 
    padding: 0.75rem 1rem; 
    margin: 0.4rem 0;
    color: #1f2937;
}
/* Ensure text inside expanders/tabs remains visible in both modes */
.stExpander, .stTabs {
    color: inherit !important;
}
""", unsafe_allow_html=True)

# Header design

st.markdown('## Capture - trial dashboard')
st.caption("Break problem into logic")
st.divider()

# Modes vs MODES

MODES = {
    1: ("🔍 First time", "Guide me through it — I haven't seen this before."),
    2: ("🧱 I'm stuck", "I know this problem but can't crack the solution."),
    3: ("⚡ Want better", "I have a solution, show me more optimal approaches."),
    4: ("🧠 Intuition-first", "Let me describe my approach, validate and improve it."),
}

# mode selection

st.markdown("### what's your problem situation")

cols = st.columns(4)
selected_mode = st.session_state.get("mode",1)

for i, (mode_id, (label,desc)) in enumerate(MODES.items()):
    with cols[i]:
        if st.button(
            f"{label}",
            key = f"mode_{mode_id}",
            use_container_width=True,
            # type = "primary" if selected_mode == mode_id else "Secondary",
            help = desc


        ):
            st.session_state['mode'] = mode_id
            st.rerun()

