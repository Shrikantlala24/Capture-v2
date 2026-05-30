---
name: chart-create
description: 'Create flowchart documentation with Mermaid. Use when: you need flowchart.md, workflow diagrams, user-interaction workflow, high-level system design, or low-level services usage design.'
argument-hint: 'Optional: special flows, edge cases, or extra diagram types to include.'
---

# Flowchart Creation

## When to Use
- Create or update flowchart.md for app workflows
- Document user-interaction flow, high-level system design, or low-level services usage
- Explain request/response paths and external dependencies in Mermaid

## Inputs to Gather
- Entry points (UI, API, CLI)
- Key services and dependencies (LLM, database, external APIs)
- Env or config that changes routing or behavior
- Common error or edge paths (validation failures, timeouts)
- Mermaid expectations (use ```mermaid fences, flowchart TD or LR)

## Procedure
1. Scan README and main entry points (for example app/main.py, frontend/*).
2. List the three workflows and outline steps with short verbs.
3. Choose diagram layouts:
   - flowchart TD for user-interaction and low-level services
   - flowchart LR for high-level system design
4. Create or update flowchart.md at the repo root.
5. Add three Mermaid diagrams with clear node labels and minimal text.
6. Add short headings and 1-2 sentences per section for context.

## Quality Checks
- Mermaid fences use ```mermaid and render without syntax errors.
- The three workflows are distinct and not duplicative.
- External services are shown explicitly.
- Env or config references are shown when they drive routing.
- Node labels stay short and consistent.
- Diagrams are readable (avoid dense, overly compressed syntax).

## Output
- flowchart.md at repo root with three sections: user-interaction workflow, high-level system design, low-level services usage design.
