# FairValue

E-commerce seller valuation SaaS. Get a free store valuation plus an improvement roadmap based on real comparable sales.

**Live**: [fairvalue-mvp.vercel.app](https://fairvalue-mvp.vercel.app) (frontend) · [fairvalue-mvp-production.up.railway.app](https://fairvalue-mvp-production.up.railway.app/api/health) (backend health check)

## Stack

- **Frontend**: React + TypeScript + Vite + TailwindCSS, deployed to Vercel
- **Backend**: Node.js + Express + TypeScript, deployed to Railway
- **Database**: Supabase (Postgres)

## Project structure

```
fairvalue-mvp/
├── frontend/   React app (Vite)
├── backend/    Express API
```

## Local setup

### 1. Database (Supabase)

1. Open the [Supabase SQL editor](https://supabase.com/dashboard/project/utildmwkhpmfbuasqhkt/sql/new) for the project.
2. Run [`backend/src/db/schema.sql`](backend/src/db/schema.sql) to create all tables.
3. Copy `backend/.env.example` to `backend/.env` and fill in `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, and a random `JWT_SECRET`.
4. Seed the 100 comps rows:

```bash
cd backend
npm install
npm run seed
```

### 2. Backend

```bash
cd backend
npm install
npm run dev
```

Runs on `http://localhost:3001`. Verify with `GET /api/health`.

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_URL if needed
npm run dev
```

Runs on `http://localhost:5173`.

### Running both at once

After the one-time setup above, you can start both servers together from the project root:

```bash
npm install   # once, installs the `concurrently` runner
npm run dev
```

## Valuation algorithm

See [`backend/src/services/valuation.ts`](backend/src/services/valuation.ts). Summary:

1. Find comps matching platform + niche + revenue within ±20%.
2. Base multiple = median of matched comps' `multiple_achieved` (default `2.5x` if fewer than 5 comps match).
3. Adjust the multiple for retention, growth, margin, and recurring revenue; cap between `1.5x` and `6.0x`.
4. `valuation = annual_revenue * adjusted_multiple`, ±10% range.
5. Confidence score scales with the number of matched comps.
6. Improvement opportunities are computed per metric and sorted by value gain.

## Deployment

- **Frontend → Vercel**: connect the GitHub repo, root directory `frontend`, set `VITE_API_URL` to the Railway backend's public URL.
- **Backend → Railway**: connect the GitHub repo, root directory `backend`, set the env vars from `backend/.env.example` (`FRONTEND_URL` must match the Vercel URL for CORS). Deploys via `backend/Dockerfile` (Node 22 — `@supabase/supabase-js`'s realtime client needs native WebSocket support, unavailable on Node 20). Railway injects its own `PORT` — when generating the public domain, set the target port to match whatever the deploy logs show ("FairValue API listening on port …"), not the app's local default.
- **Database → Supabase**: project `utildmwkhpmfbuasqhkt` (already provisioned). Run `schema.sql`, then `npm run seed`.

## What's stubbed for MVP

- Paid subscription checkout (Stripe) — button present, disabled/"coming soon"
- Dashboard PDF export — disabled
- Investor platform / deal marketplace — not built
