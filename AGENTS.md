# AGENTS.md

This file gives repository-specific instructions for coding agents working in this project.

## Project Layout

- `frontend/`: React (Create React App) UI.
- `backend/`: Express API backed by PostgreSQL.
- `misc/`: one-off data assets/scripts (including CSV imports).

## Stack Summary

- Frontend: React 18, `react-router-dom`, `react-chartjs-2`, `chart.js`.
- Backend: Node.js + Express + `pg` + `dotenv` + `axios`.
- Data store: PostgreSQL table `stocks` (queried directly from backend).
- Market data source: Alpha Vantage (via `AV_API_KEY`).

## Install & Run

Run installs per package directory:

```bash
cd frontend && npm install
cd ../backend && npm install
```

Run services in separate terminals:

```bash
# backend (default: http://localhost:5000)
cd backend && npm start

# frontend (default: http://localhost:3000)
cd frontend && npm start
```

## Required Backend Environment

Create `backend/.env` with:

```dotenv
DB_USER=...
DB_HOST=...
DB_DATABASE=...
DB_PASSWORD=...
DB_PORT=5432
AV_API_KEY=...
PORT=5000
```

Notes:
- `backend/server.js` imports `updateStocks.js`, so starting the backend also triggers a stock data update job.
- Without valid DB/API credentials, backend startup will fail or log repeated update errors.

## API Endpoints (Current)

- `GET /api/stocks`: latest row per ticker.
- `GET /api/stocks/:tickerSymbol?period=5d|3m|6m|ytd|1y|5y|all`: historical close prices.
- `GET /api/stocks/:ticker_symbol/metrics`: 52-week min/max and previous close.

## Testing & Validation

Frontend:

```bash
cd frontend
CI=true npm test -- --watch=false
```

Backend:
- No meaningful automated test suite is configured (`npm test` intentionally exits with error).

When making changes, prefer:
1. Run frontend tests if dependencies are installed.
2. Smoke-test backend routes locally if DB/env are available.

## Coding Conventions For This Repo

- Keep changes scoped to the relevant package (`frontend` vs `backend`).
- Do not introduce new frameworks/build tools unless explicitly requested.
- Preserve existing API route shapes to avoid breaking the current frontend.
- Avoid hardcoding non-localhost API URLs unless introducing env-based configuration.
- For SQL updates, keep parameterized queries (no string interpolation for values).

## Known Gaps / Caveats

- `frontend/src/App.test.js` is the CRA default test and is currently out of sync with the actual UI.
- `backend/updateStocks.js` uses implicit globals (`q`, `v`) and maps both adjusted close and volume from key `5` in Alpha Vantage payloads; review carefully before relying on imported values.
- `frontend` currently fetches backend data with hardcoded `http://localhost:5000`.

## Agent Workflow Expectations

- Before editing, inspect impacted files and adjacent logic.
- After editing, run the narrowest relevant checks available.
- Report any unrun checks and why they were skipped (missing deps, missing DB/env, etc.).
- Do not revert unrelated workspace changes.
