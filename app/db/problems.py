"""
Lightweight SQLite layer for LeetCode dataset enrichment.
Expected dataset CSV columns: title, difficulty, tags, description, constraints
Place your Kaggle CSV at data/leetcode.csv and run: python -m app.db.setup
"""
import sqlite3
import os
from pathlib import Path
from typing import Optional

DB_PATH = Path(__file__).parent.parent.parent / "data" / "problems.db"


def get_conn():
    DB_PATH.parent.mkdir(exist_ok=True)
    return sqlite3.connect(DB_PATH)


def setup_db(csv_path: str):
    """One-time setup: load CSV into SQLite with FTS."""
    import csv
    conn = get_conn()
    conn.execute("""
        CREATE VIRTUAL TABLE IF NOT EXISTS problems USING fts5(
            title, difficulty, tags, description, constraints,
            tokenize='porter ascii'
        )
    """)
    with open(csv_path) as f:
        reader = csv.DictReader(f)
        rows = [
            (
                r.get("title", ""),
                r.get("difficulty", ""),
                r.get("tags", ""),
                r.get("description", ""),
                r.get("constraints", ""),
            )
            for r in reader
        ]
    conn.executemany("INSERT INTO problems VALUES (?,?,?,?,?)", rows)
    conn.commit()
    conn.close()
    print(f"Loaded {len(rows)} problems into {DB_PATH}")


def fuzzy_search(query: str, limit: int = 1) -> Optional[dict]:
    """FTS search — returns best match or None if DB doesn't exist."""
    if not DB_PATH.exists():
        return None
    try:
        conn = get_conn()
        row = conn.execute(
            "SELECT title, difficulty, tags, description, constraints FROM problems WHERE problems MATCH ? LIMIT ?",
            (query, limit)
        ).fetchone()
        conn.close()
        if not row:
            return None
        return {
            "title": row[0],
            "difficulty": row[1],
            "tags": row[2],
            "description": row[3],
            "constraints": row[4],
        }
    except Exception:
        return None


def similar_problems(tags: str, exclude_title: str, limit: int = 3) -> list:
    """Find similar problems by tag overlap."""
    if not DB_PATH.exists():
        return []
    try:
        tag_list = [t.strip() for t in tags.split(",") if t.strip()]
        if not tag_list:
            return []
        conn = get_conn()
        query = " OR ".join(tag_list[:3])  # top 3 tags for FTS
        rows = conn.execute(
            "SELECT title, difficulty, tags FROM problems WHERE problems MATCH ? AND title != ? LIMIT ?",
            (query, exclude_title, limit)
        ).fetchall()
        conn.close()
        return [{"title": r[0], "difficulty": r[1], "pattern": r[2].split(",")[0]} for r in rows]
    except Exception:
        return []


def build_dataset_context(problem: str) -> tuple[str, list]:
    """
    Returns (context_string_for_prompt, similar_problems_list).
    Falls back gracefully if no DB.
    """
    match = fuzzy_search(problem)
    if not match:
        return "", []

    context = f"""
Dataset match found:
- Title: {match['title']}
- Difficulty: {match['difficulty']}
- Tags: {match['tags']}
- Description: {match['description'][:400]}
- Constraints: {match['constraints'][:200]}
Use this to enrich your analysis.
"""
    sim = similar_problems(match["tags"], match["title"])
    return context, sim