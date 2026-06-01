# Capture Web UI

React + Vite UI for the Capture DSA Analyser. Includes landing, analyze, and
history pages, with session history stored locally in the browser.

## Quickstart

```bash
cd web
npm install
npm run dev
```

The UI expects the API at `http://localhost:8000` (endpoint: `/analyse`).

## Configuration

You can override the API base URL via an environment variable:

```bash
VITE_API_BASE=http://localhost:8000
```

Create a `.env` file in `web/` if you want to keep it persistent.
