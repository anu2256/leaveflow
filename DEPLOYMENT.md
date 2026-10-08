# LeaveFlow Deployment Guide

Deploy the Express API (`server/`) to **Render**, the Vite React app (`client/`) to
**Vercel** (or Netlify), backed by a **Neon** PostgreSQL database.

## Architecture

```
Vercel/Netlify (static client/dist)
     │  /api/* proxied (rewrite)  ─────►  Render Web Service (server/, Express :PORT)
     │                                         │  DATABASE_URL (SSL)
     └── serves the React SPA                  ▼
                                          Neon PostgreSQL
```

The client calls a **relative** `/api` base (`client/src/api.js` → `const API_BASE = '/api'`).
In dev that is handled by Vite's proxy, which does **not** exist in production, so the
frontend host rewrites `/api/*` to the Render backend. Same origin → **no code changes
and no CORS** (JWT is sent as a `Bearer` header from `localStorage`, not cookies).

---

## Part A — Seed the Neon database

The `migrate` script reads `DATABASE_URL` and applies the schema + seed (which contains the
corrected `Password123!` hash).

PowerShell:

```powershell
cd server
$env:DATABASE_URL="postgresql://<user>:<pass>@<host>/<db>?sslmode=require"
npm ci
npm run migrate
```

bash:

```bash
cd server
DATABASE_URL="postgresql://<user>:<pass>@<host>/<db>?sslmode=require" npm run migrate
```

Expected: `applied 001_init.sql`, `applied 002_seed.sql`, `applied 003_add_decision_note.sql`
(5 tables, 3 seed users, leave types).

- **SSL:** keep `?sslmode=require`. `pg@8.23` honors `sslmode` from the connection string —
  no change to `pool.js` needed. If Neon appended `&channel_binding=require` and you get an
  SSL error, drop just that one parameter.
- Either the standard or pooled (`-pooler`) Neon URL works for a long-running Render service.
- `dotenv` in `pool.js` does not override a shell-set `DATABASE_URL`, so the Neon URL wins
  over any local `server/.env`.

---

## Part B — Backend on Render (Web Service)

| Setting | Value |
| --- | --- |
| Root Directory | `server` |
| Runtime | Node |
| Build Command | `npm ci` |
| Start Command | `npm start` (runs `node src/server.js`) |
| Health Check Path | `/api/health` |

Environment variables:

| Key | Value |
| --- | --- |
| `DATABASE_URL` | Neon URL (with `?sslmode=require`) |
| `JWT_SECRET` | a strong random string (`openssl rand -hex 32`) — not the dev value |

- **Do not set `PORT`** — Render injects it, and `server/src/server.js` uses
  `process.env.PORT || 4000`.
- **Migrations:** run Part A once against Neon, or set Render's **Pre-Deploy Command** to
  `npm run migrate` (idempotent via `schema_migrations`).
- Optional: env `NODE_VERSION=20` to match the Dockerfile.
- `server/package-lock.json` is Linux-synced, so `npm ci` works on Render.

Verify after deploy: `https://YOUR-RENDER-APP.onrender.com/api/health` → `{"status":"ok"}`.

---

## Part C — Frontend

Pick one host. Both proxy `/api/*` to Render.

### Vercel

| Setting | Value |
| --- | --- |
| Root Directory | `client` |
| Framework Preset | Vite |
| Build Command | `npm run build` |
| Output Directory | `dist` |

`client/vercel.json` (already in the repo — replace the host with your Render URL):

```json
{
  "rewrites": [
    { "source": "/api/:path*", "destination": "https://YOUR-RENDER-APP.onrender.com/api/:path*" }
  ]
}
```

### Netlify (alternative)

`client/netlify.toml`:

```toml
[build]
  base = "client"
  command = "npm run build"
  publish = "dist"

# API proxy must precede the SPA fallback
[[redirects]]
  from = "/api/*"
  to = "https://YOUR-RENDER-APP.onrender.com/api/:splat"
  status = 200
  force = true

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

No frontend env vars are required with the rewrite approach.

**Client lockfile note:** `client/package-lock.json` has been regenerated on Linux so
`npm ci` works on Vercel/Netlify's Linux builders (its `@unrs/resolver`/`@emnapi` native
deps are otherwise platform-sensitive). If you ever regenerate it on Windows again and a
deploy fails with `npm error EUSAGE … lock file … out of sync`, re-run:

```bash
docker run --rm -v "$PWD/client:/app" -w /app node:20-alpine npm install --package-lock-only
```

and commit the result (or set the install command to `npm install`).

---

## Part D — Verify end-to-end

1. Open the Vercel/Netlify URL → login screen loads.
2. Log in as `ishara@ceylonroots.lk` / `Password123!` → employee dashboard.
3. Network tab: `/api/auth/login` returns 200 from your frontend origin (proxied).
4. Log in as `ruwan@ceylonroots.lk` → approvals page.

---

## Project-specific gotchas

- **No CORS needed** thanks to the same-origin rewrite. Calling Render directly (absolute
  URL) instead would require adding CORS middleware to `server/src/app.js`.
- **Secrets:** use a fresh `JWT_SECRET` in prod; never reuse `ci-test-secret` or the dev
  value. Neon credentials live only in Render env vars (`.env`/`.env.test` are gitignored).
- **Seed password:** seeded accounts use `Password123!` — change them before real use.
- **`docker-compose.yml`** is for local all-in-one runs and is independent of this path.
- **Free-tier cold starts:** Render's free Web Service sleeps when idle; the first request
  (including the frontend's first `/api` call) may take ~30–50s.
