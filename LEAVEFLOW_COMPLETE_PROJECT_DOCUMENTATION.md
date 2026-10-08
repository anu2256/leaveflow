# LeaveFlow — Complete Project Documentation

> Single reference for supervisor discussions, internship progress, technical interviews, and presentations.
> Everything below reflects the **actual current repository state** (git `HEAD` on `main`, commit `0575104`).
> Items that are not built are marked **Not implemented**; partial ones **Partially implemented**.

---

## 1. Project Overview

- **Project name:** LeaveFlow
- **Problem it solves:** Manual leave handling (emails/spreadsheets) is slow, error-prone, and hard to audit. LeaveFlow centralizes leave requests, approvals, and balances in one system with clear rules.
- **Target users:** Employees, Managers, and HR Administrators of an organization.
- **Main purpose:** Let employees apply for and track leave, let managers approve/reject their team's requests, and give HR an organization-wide view — with balances updated automatically.
- **Main features:** JWT login, role-based access (EMPLOYEE / MANAGER / HR_ADMIN), apply/cancel leave, working-day leave calculation (weekends + holidays excluded), manager approval/rejection with decision notes, leave balances, HR overview.
- **Current implementation status:** Frontend, backend, database, auth, testing (unit + API + component + E2E), Docker + Docker Compose, and GitHub Actions CI/CD are **implemented**. Cloud deployment is **partially implemented** (deployment config + guide exist; a live deployment is not proven by the repository).

### High-level architecture

```
User (browser)
     ↓
React SPA (Vite build)  ──[ in Docker: served by Nginx ]
     ↓   /api/* proxied
Express REST API (Node.js)
     ↓   parameterized SQL (pg)
PostgreSQL
```

In Docker Compose the same picture is three services: `web` (Nginx) → `api` (Express) → `db` (PostgreSQL).

---

## 2. Technology Stack

Documented from `package.json` files, source, Dockerfiles, and workflows.

### Frontend
- **React 19** — UI library; builds the whole single-page app (`client/src/*.jsx`).
- **Vite 8** — dev server + production bundler (`client/vite.config.js`, `npm run build` → `dist/`).
- **JavaScript (ES Modules), HTML, CSS** — app code (`.jsx`), entry `index.html`, styling in plain CSS (`App.css`, `index.css`). No CSS framework.
- **oxlint** — linter configured for the client (`client/.oxlintrc.json`, `npm run lint`). *(ESLint is **Not implemented**.)*

### Backend
- **Node.js + Express 5** — REST API (`server/src/app.js`, `server/src/routes/*`).
- **REST API** — resource-based endpoints under `/api`.
- **pino + pino-http** — structured JSON logging (`server/src/middleware/logging.js`).
- **dotenv** — loads environment variables (`server/src/db/pool.js`).

### Database
- **PostgreSQL 16** — relational database (used in Docker Compose and CI).
- **pg (node-postgres)** — driver + connection pool (`server/src/db/pool.js`).
- Migrations are plain `.sql` applied by a small custom runner (`server/src/db/migrate.js`).

### Authentication & Security
- **jsonwebtoken (JWT)** — signs/verifies stateless auth tokens.
- **bcrypt** — one-way password hashing.
- **Custom middleware** — `requireAuth` (valid token) and `requireRole(...)` (role check) in `server/src/middleware/auth.js`.
- **Role-based access** — EMPLOYEE / MANAGER / HR_ADMIN.

### Testing
- **Jest** + **Supertest** — backend unit + API integration tests (`server/tests/`).
- **Vitest** + **React Testing Library** + **jsdom** — frontend component tests (`client/src/ApplyLeaveForm.test.jsx`).
- **Playwright** — end-to-end browser test (`client/e2e/approve-flow.spec.js`).

### DevOps
- **Docker** — images for API (`server/Dockerfile`) and web (`client/Dockerfile`, multi-stage → Nginx).
- **Docker Compose** — `docker-compose.yml` orchestrates `db`, `api`, `web`.
- **Nginx** — serves the built SPA and proxies `/api` (`client/nginx.conf`).
- **GitHub Actions** — CI (`.github/workflows/ci.yml`) and release (`.github/workflows/release.yml`).
- **GitHub Container Registry (GHCR)** — release workflow pushes the API image to `ghcr.io/anu2256/leaveflow-api`.

### Version Control
- **Git + GitHub** — feature branches merged into `main` via Pull Requests (visible in history: PRs #2–#5).

---

## 3. Project Structure

Only folders/files that actually exist are listed.

```
LeaveFlow/
├── client/                         # React + Vite frontend
│   ├── src/
│   │   ├── App.jsx                  # Root; role-based rendering
│   │   ├── Login.jsx                # Login screen
│   │   ├── MyLeave.jsx              # Employee's requests + cancel
│   │   ├── ApplyLeaveForm.jsx       # Apply-for-leave form
│   │   ├── LeaveBalance.jsx         # Balance cards + progress bars
│   │   ├── Approvals.jsx            # Manager approvals UI
│   │   ├── HrAdmin.jsx              # HR organization-wide overview
│   │   ├── api.js                   # fetch wrapper + API calls
│   │   ├── App.css / index.css      # Styling
│   │   ├── ApplyLeaveForm.test.jsx  # Vitest component test
│   │   └── test/setup.js            # jest-dom setup for Vitest
│   ├── e2e/
│   │   ├── approve-flow.spec.js     # Playwright E2E (apply→approve)
│   │   └── global-setup.cjs         # Resets test DB before E2E
│   ├── Dockerfile                   # Multi-stage build → Nginx
│   ├── nginx.conf                   # SPA + /api proxy
│   ├── vercel.json                  # /api rewrite → backend (deploy config)
│   ├── vite.config.js               # Vite + Vitest config
│   └── .dockerignore / .oxlintrc.json
├── server/                          # Express backend
│   ├── src/
│   │   ├── app.js                   # Express app, middleware, routers
│   │   ├── server.js                # Starts HTTP server (PORT)
│   │   ├── routes/
│   │   │   ├── auth.js              # /api/auth (login, me)
│   │   │   ├── leaveRequests.js     # /api/leave-requests (CRUD)
│   │   │   ├── balances.js          # /api/balances
│   │   │   ├── team.js              # /api/team/requests
│   │   │   └── health.js            # /api/health
│   │   ├── middleware/
│   │   │   ├── auth.js              # requireAuth, requireRole
│   │   │   └── logging.js           # pino-http logger
│   │   ├── lib/
│   │   │   ├── leaveDays.js         # Working-day calculation
│   │   │   └── holidays.js          # 2026 holiday list
│   │   └── db/
│   │       ├── pool.js             # pg Pool from DATABASE_URL
│   │       ├── migrate.js          # Migration runner
│   │       └── migrations/
│   │           ├── 001_init.sql     # Schema
│   │           ├── 002_seed.sql     # Seed users + leave types
│   │           └── 003_add_decision_note.sql
│   ├── tests/
│   │   ├── leaveDays.test.js        # Jest unit tests
│   │   ├── api.test.js              # Supertest API tests
│   │   └── setup.env.js             # Loads .env.test for Jest
│   ├── Dockerfile                   # API image
│   └── .dockerignore
├── .github/workflows/
│   ├── ci.yml                       # test-api + test-client jobs
│   └── release.yml                  # build & push API image to GHCR
├── docker-compose.yml               # db + api + web
├── docs/
│   ├── requirement.md               # SRS / user stories
│   ├── design.md                    # Design notes
│   └── api.md                       # API contract
├── TEST_CASES.md                    # Manual test cases
├── BUG_REPORT.md                    # Leave-duration bug report
├── DEPLOYMENT.md                    # Cloud deploy guide (uncommitted)
└── LEAVEFLOW_COMPLETE_PROJECT_DOCUMENTATION.md  # this file
```

*(Note: `server/leaveflow.db` exists on disk but is git-ignored and unused — the app uses PostgreSQL via `pg`, not SQLite.)*

---

## 4. Features

All features below are **implemented** unless noted.

| Feature | Purpose | Who | Frontend | Backend API | Tables | Auth |
|---|---|---|---|---|---|---|
| Login | Authenticate, get JWT | All | `Login.jsx` | `POST /api/auth/login` | users | Public |
| JWT authentication | Stateless identity on each request | All | `api.js` (Bearer) | `requireAuth` | — | Token |
| Role-based access | Different rights per role | All | `App.jsx` routing | `requireRole` + checks | users | Token+role |
| Employee dashboard | Home for employees | Employee | `App.jsx`,`LeaveBalance`,`MyLeave`,`ApplyLeaveForm` | balances + leave-requests | all | EMPLOYEE |
| Leave application | Submit a leave request | Employee | `ApplyLeaveForm.jsx` | `POST /api/leave-requests` | leave_requests, leave_types, leave_balances | Token |
| Leave balance | See remaining days | Employee | `LeaveBalance.jsx` | `GET /api/balances` | leave_types, leave_balances | Token |
| Leave request status | Track PENDING/APPROVED/… | Employee | `MyLeave.jsx` | `GET /api/leave-requests` | leave_requests | Token |
| Leave cancellation | Cancel own pending request | Employee | `MyLeave.jsx` | `DELETE /api/leave-requests/:id` | leave_requests | EMPLOYEE (owner) |
| Manager approval | Approve team requests | Manager | `Approvals.jsx` | `PATCH /api/leave-requests/:id` | leave_requests, leave_balances, users | MANAGER |
| Manager rejection | Reject with a note | Manager | `Approvals.jsx` | `PATCH …` (action=reject) | leave_requests | MANAGER |
| Decision notes | Reason on approve/reject | Manager/HR | `Approvals.jsx`,`MyLeave.jsx` | `PATCH …` | leave_requests | MANAGER/HR |
| Team management view | See team's pending requests | Manager | `Approvals.jsx` | `GET /api/team/requests` | leave_requests, users, leave_types | MANAGER |
| HR administration | Org-wide request overview | HR Admin | `HrAdmin.jsx` | `GET /api/team/requests` | as above | HR_ADMIN |
| Leave duration calc | Count working days | System | — | `lib/leaveDays.js` | — | — |
| Weekend exclusion | Skip Sat/Sun | System | — | `lib/leaveDays.js` | — | — |
| Holiday exclusion | Skip configured 2026 holidays | System | — | `lib/leaveDays.js` + `holidays.js` | — | — |
| Database persistence | Durable data | System | — | `pg` + Docker volume | all | — |
| Structured logging | JSON request logs | System | — | `middleware/logging.js` | — | — |

**Not implemented:** password reset, email notifications, leave carry-forward, half-day leave (documented in `docs/api.md` as a contract idea but not built), overlapping-request rejection (documented but not enforced in code), rate limiting, CORS/Helmet.

---

## 5. How Each Main Feature Works

**Login**
```
Login form → POST /api/auth/login → find user by email → bcrypt.compare(password, hash)
→ jwt.sign({id, role}) → { token, user } → React stores token in localStorage → dashboard
```

**Apply leave**
```
ApplyLeaveForm → POST /api/leave-requests (Bearer) → requireAuth → validate fields
→ end_date ≥ start_date → leaveDays() (working days) → ≤ 30 days → leave type exists
→ balance check → INSERT (status PENDING) → 201 JSON → MyLeave list refreshes
```

**View leave**
```
MyLeave → GET /api/leave-requests (Bearer) → requireAuth → employee: own rows; manager/HR: all
→ JSON array → table renders status badges
```

**Cancel leave**
```
MyLeave "Cancel" → confirm() → DELETE /api/leave-requests/:id → requireAuth → must be owner + EMPLOYEE
→ must be PENDING → UPDATE status='CANCELLED' → 200 → list refreshes
```

**Manager approval**
```
Approvals "Approve" → PATCH /api/leave-requests/:id {action:'approve'} → requireAuth
→ role MANAGER/HR → BEGIN → SELECT ... FOR UPDATE → manager owns team? → status PENDING?
→ compute working days → UPSERT leave_balances (used_days += days) → UPDATE status='APPROVED'
→ COMMIT → 200 → card leaves the pending list
```

**Manager rejection**
```
Approvals "Reject" (+ note required) → PATCH {action:'reject', decision_note}
→ same checks → UPDATE status='REJECTED', decision_note → 200 (balance NOT changed)
```

**Leave balance**
```
LeaveBalance → GET /api/balances?year=YYYY → requireAuth → for the user, every leave type:
allocation, used_days (COALESCE 0), remaining = allocation - used → cards + progress bars
```

**HR functions**
```
HrAdmin → GET /api/team/requests → requireAuth + requireRole(MANAGER,HR_ADMIN)
→ HR branch returns ALL requests with employee info → overview + status summary
```

---

## 6. REST API Documentation

Base URL: `/api`. All errors use `{ "error": { "code", "message" } }`.

### Authentication
| Method | Route | Purpose | Auth | Role | Body | Success | Errors |
|---|---|---|---|---|---|---|---|
| POST | `/api/auth/login` | Log in, return JWT | Public | — | `email, password` | 200 `{token, user}` | 400 VALIDATION_ERROR, 401 BAD_CREDENTIALS |
| GET | `/api/auth/me` | Current token identity | Yes | any | — | 200 `{id, role, iat, exp}` | 401 NO_TOKEN/BAD_TOKEN |

### Leave Requests
| Method | Route | Purpose | Auth | Role | Params | Success | Errors |
|---|---|---|---|---|---|---|---|
| GET | `/api/leave-requests` | List (employee=own, mgr/HR=all) | Yes | any | query `status?` | 200 array | 400 VALIDATION_ERROR, 401 |
| POST | `/api/leave-requests` | Create PENDING request | Yes | any (self) | body `leave_type_id,start_date,end_date,reason?` | 201 request | 400, 404 NOT_FOUND, 409 INSUFFICIENT_BALANCE, 401 |
| PATCH | `/api/leave-requests/:id` | Approve/reject | Yes | MANAGER/HR_ADMIN | url `id`; body `action, decision_note?` | 200 request | 400, 403 FORBIDDEN, 404, 409 INVALID_STATE, 401 |
| DELETE | `/api/leave-requests/:id` | Cancel own pending | Yes | EMPLOYEE (owner) | url `id` | 200 request | 403, 404, 409 INVALID_STATE, 401 |

### Leave Balances
| Method | Route | Purpose | Auth | Role | Params | Success | Errors |
|---|---|---|---|---|---|---|---|
| GET | `/api/balances` | Balances for a year | Yes | any (own) | query `year` (required) | 200 array | 400 VALIDATION_ERROR, 401 |

### Team / HR-Admin
| Method | Route | Purpose | Auth | Role | Success | Errors |
|---|---|---|---|---|---|---|
| GET | `/api/team/requests` | Manager=team pending; HR=all | Yes | MANAGER/HR_ADMIN | 200 array w/ employee info | 403 FORBIDDEN, 401 |

*(There is no separate HR/Admin route file; HR uses the same endpoints.)*

### Health
| Method | Route | Purpose | Auth | Success |
|---|---|---|---|---|
| GET | `/api/health` | Liveness check | Public | 200 `{status:"ok"}` |

**Total: 9 endpoints.** No others exist.

---

## 7. Authentication & Authorization

```
email + password
   ↓  (POST /api/auth/login)
bcrypt.compare(password, stored_hash)
   ↓  success
jwt.sign({ id, role }, JWT_SECRET, { expiresIn: '8h' })
   ↓
frontend stores token in localStorage
   ↓  every request: Authorization: Bearer <token>
requireAuth  → jwt.verify(token, JWT_SECRET) → sets req.user = { id, role }
   ↓
requireRole('MANAGER','HR_ADMIN')  (on protected routes / inline checks)
   ↓
API access granted
```

- **JWT** — a signed token proving who you are; the server doesn't store sessions.
- **bcrypt** — passwords are stored as a one-way hash; the plain password is never saved.
- **Bearer token** — the token is sent in the `Authorization: Bearer …` header.
- **requireAuth** — rejects requests without a valid token → **401**.
- **requireRole** — rejects the wrong role → **403**.
- **Roles:** EMPLOYEE (own leave), MANAGER (team approvals), HR_ADMIN (org-wide view).
- **401 vs 403:** 401 = not logged in / bad token; 403 = logged in but not allowed.

---

## 8. Database

- **Technology:** PostgreSQL 16, accessed via `pg` connection pool.
- **Migrations:** `001_init.sql` (schema), `002_seed.sql` (seed), `003_add_decision_note.sql` (adds `decision_note`). Applied by `migrate.js`, tracked in `schema_migrations`.

### Tables

**users**
- `id` PK, `name`, `email` (UNIQUE, NOT NULL), `password_hash`, `role` (CHECK in EMPLOYEE/MANAGER/HR_ADMIN), `manager_id` (FK → users.id, nullable), `created_at`.

**leave_types**
- `id` PK, `name` (UNIQUE), `annual_allocation`.
- Seed: Annual (14), Casual (7), Sick (7).

**leave_requests**
- `id` PK, `user_id` FK→users, `leave_type_id` FK→leave_types, `start_date`, `end_date`, `reason` (nullable), `status` (CHECK PENDING/APPROVED/REJECTED/CANCELLED, default PENDING), `decided_by` FK→users (nullable), `decided_at`, `decision_note` (added by 003), `created_at`.

**leave_balances**
- Composite PK `(user_id, leave_type_id, year)`; `user_id` FK, `leave_type_id` FK, `year`, `used_days` NUMERIC default 0.

**schema_migrations**
- `filename` PK, `applied_at`. Records which migrations ran (idempotency).

**Constraints/indexes:** primary keys and the `email`/`leave_types.name` UNIQUE constraints create indexes automatically; the `role` and `status` CHECK constraints enforce valid values. **No additional custom indexes** are defined.

### ER-style diagram
```
users ─────────────┐ (manager_id → users.id, self-reference)
  │ 1               │
  │                 │ decided_by
  ▼ N               ▼
leave_requests ──► users
  │ N
  ▼ 1
leave_types ◄──── N leave_balances ──► 1 users
                     (PK: user_id + leave_type_id + year)
```

**Seed data:** 3 users — Ruwan Jayasuriya (MANAGER), Ishara Fernando (EMPLOYEE, manager_id=Ruwan), Dilini Weerasinghe (HR_ADMIN); password for all seeded users: `Password123!`.

---

## 9. Leave Calculation Logic

Implemented in `server/src/lib/leaveDays.js` as `leaveDays(startDate, endDate, holidays = [])`:

- **Inclusive** of both start and end dates.
- **Excludes weekends** (Saturday, Sunday).
- **Excludes holidays** passed in (the route passes `HOLIDAYS_2026`).
- **Invalid dates** → throws `"Invalid date"`.
- **End before start** → throws `"end_date must be on or after start_date"`.
- Timezone-safe: `YYYY-MM-DD` strings and `Date` objects are read by calendar day, so the day never shifts.

**Configured holidays (`server/src/lib/holidays.js`, `HOLIDAYS_2026`):**
`2026-04-13` (day before Sinhala & Tamil New Year), `2026-04-14` (New Year Day), `2026-05-01` (Vesak Full Moon Poya), `2026-05-02` (day after Vesak).

**Effect on balances:** the number returned is used (a) at creation to check `used + days ≤ allocation`, and (b) on approval to increment `leave_balances.used_days` — so only working days are charged.

---

## 10. Validation & Error Handling

**Validation rules (server-side):**
- Login: `email` and `password` required.
- Create leave: all of `leave_type_id, start_date, end_date` required; `end_date ≥ start_date`; working days `≤ 30`; leave type must exist; `used + days ≤ allocation`.
- Approve/reject: `action` must be exactly `approve` or `reject`.
- List: `status` (if given) must be one of the four valid values.
- Balances: `year` required.

**Error codes (all present in code):**

| Code | HTTP | Meaning |
|---|---|---|
| `VALIDATION_ERROR` | 400 | Bad/missing input |
| `BAD_CREDENTIALS` | 401 | Wrong email/password |
| `NO_TOKEN` | 401 | Missing/malformed Authorization header |
| `BAD_TOKEN` | 401 | Invalid/expired JWT |
| `FORBIDDEN` | 403 | Authenticated but not allowed |
| `NOT_FOUND` | 404 | Missing leave type / request |
| `INSUFFICIENT_BALANCE` | 409 | Would exceed allocation |
| `INVALID_STATE` | 409 | Action not allowed for current status |
| `INTERNAL` | 500 | Unhandled server error (global handler) |

All errors return the same JSON shape via the Express error handler in `app.js`.

---

## 11. Testing

Four layers, all implemented:

- **Unit (Jest):** `server/tests/leaveDays.test.js` — working-day calculation (Mon–Fri = 5, single day, Fri–Mon excludes weekend, end-before-start throws, holiday excluded, Vesak excluded).
- **API integration (Jest + Supertest):** `server/tests/api.test.js` — health, login, 400/401/403, cancellation flow (200/409/403/404), and a "connected to leaveflow_test" guard. Runs against an **isolated `leaveflow_test`** database (loaded via `tests/setup.env.js` → `.env.test`), cleaning tables in `beforeEach`; `afterAll` closes the pool (no open handles).
- **Frontend component (Vitest + React Testing Library + jsdom):** `client/src/ApplyLeaveForm.test.jsx` — successful submit (API mocked, asserts payload + success message + `onCreated`) and the end-before-start validation guard.
- **End-to-end (Playwright):** `client/e2e/approve-flow.spec.js` — real browser flow: Ishara logs in → applies → sees PENDING → Ruwan logs in → approves → Ishara sees APPROVED. Uses an isolated stack (API on 4100 → `leaveflow_test`, Vite on 5174); `global-setup.cjs` resets the test DB and normalizes seed passwords. Browser: local **Google Chrome** via `channel: 'chrome'` (the bundled Chromium CDN is blocked in this environment).

**Verified test results (this environment):**
- Backend (Jest): **16/16 passed**
- Frontend (Vitest): **2/2 passed**
- E2E (Playwright): **1 passed**

**Coverage:** `npx jest --coverage` was run; overall branch coverage ~60% after adding a DELETE-404 test.

---

## 12. Bug Fix / Quality Improvement

**Leave-duration bug** (see `BUG_REPORT.md`, BUG-001):
- **Problem:** the original duration used an inclusive **calendar-day** formula `floor((end - start)/day) + 1`, which counted weekends and holidays.
- **Impact:** leave balances were reduced by too many days.
- **Fix:** extracted a tested `leaveDays()` helper that counts **working days only**, excluding weekends and configured holidays, and threaded `HOLIDAYS_2026` into both the create and approve paths.
- **How testing helped:** unit tests (including a Vesak holiday case) pin the correct counts and prevent regressions.

**CI authentication bug** (also fixed) — documented fully in section 16.

---

## 13. Docker

**Concepts:** a **Dockerfile** is a recipe to build an **image**; a **container** is a running instance of an image; a **volume** persists data outside the container; a **health check** tells Compose when a service is truly ready; **Docker Compose** runs multiple services together.

**Backend `server/Dockerfile`:** `node:20-alpine`, copy `package*.json` → `npm ci --omit=dev` (cached layer) → copy source → `EXPOSE 4000` → `CMD ["node","src/server.js"]`. Ignores via `server/.dockerignore` (`node_modules`, `.env`, …).

**Frontend `client/Dockerfile` (multi-stage):**
- Stage 1 (`node:20-alpine`): `npm ci` → `npm run build` → `/app/dist`.
- Stage 2 (`nginx:alpine`): copy `nginx.conf` and the built `dist/` → `EXPOSE 80` → run nginx foreground.

**`docker-compose.yml` services:**
- `db` — `postgres:16-alpine`, env user/password/db, **named volume `db-data`** for persistence, **health check** `pg_isready -U postgres -d leaveflow`.
- `api` — built from `./server`, `DATABASE_URL` → `db` service, `JWT_SECRET` from `./server/.env`, internal port **4000**, **`depends_on: db (service_healthy)`**.
- `web` — built from `./client`, published on host **8080** (`8080:80`), `depends_on: api`.

**Commands used:**
```bash
docker build -t leaveflow-api ./server
docker compose up -d db          # start db, wait healthy
docker compose run --rm api npm run migrate   # migrate + seed
docker compose up -d             # start all services
docker compose ps
docker compose logs -f api
docker compose down              # stop (keep volume)
docker compose down -v           # stop AND delete the db volume (destructive)
```

---

## 14. Nginx

`client/nginx.conf` (used inside the `web` image):
- **Serves the React SPA** from `/usr/share/nginx/html`.
- **SPA fallback:** `try_files $uri $uri/ /index.html;` so deep links/refreshes work.
- **API proxy:** `location /api/ { proxy_pass http://api:4000; }` forwards API calls to the backend, preserving the `/api` prefix.
- **`api:4000`** is the **Compose service name** on the internal Docker network. Inside a container, `localhost` means the container itself — not the API — so you must use the service name (`api`), which Docker's DNS resolves to the API container.

---

## 15. CI/CD

- **CI (Continuous Integration):** every push/PR automatically installs, migrates, and tests the code, catching breakage early.
- **CD (Continuous Delivery):** when code reaches `main`, an image is automatically built and published (to GHCR) — ready to deploy.

**On a Pull Request / push:** `.github/workflows/ci.yml` runs two jobs on `ubuntu-latest`:

```
ci.yml
├── test-api
│   ├── PostgreSQL 16 service (pg_isready health checks)
│   ├── env: DATABASE_URL=…leaveflow_test, JWT_SECRET=ci-test-secret
│   ├── checkout → setup-node@20 (npm cache: server/package-lock.json)
│   ├── npm ci (server)
│   ├── npm run migrate (server)   # schema + seed into leaveflow_test
│   └── npm test (server)          # Jest
└── test-client
    ├── checkout → setup-node@20 (npm cache: client/package-lock.json)
    ├── npm ci (client)
    ├── npx vitest run
    └── npm run build
```

**On push to `main`:** `.github/workflows/release.yml` (job `build-and-push`):
```
checkout → docker/login-action@v3 (ghcr.io, GITHUB_TOKEN)
→ docker/build-push-action@v6 (context ./server, server/Dockerfile)
→ push tags: ghcr.io/anu2256/leaveflow-api:<sha> and :main
```
Permissions: `contents: read`, `packages: write`.

---

## 16. CI Failure and Fix

**What failed:** the backend `test-api` job — **7 of 16** Jest tests failed, all with HTTP **401** (the first being `POST /api/auth/login accepts valid credentials`, expected 200).

**Root cause:** the bcrypt hash committed in `002_seed.sql` did **not** correspond to the test password `Password123!`. Verified with `bcrypt.compareSync('Password123!', <seed hash>) === false`.

**Why local worked but CI failed:** local test/dev databases already had an Ishara row whose stored hash *was* a valid `Password123!` hash (set/normalized earlier). CI builds a **fresh** database and seeds it **only** from the committed migration, so it used the non-matching hash → login returned 401 → every test that logs in first then failed with 401. (`.env`/`.env.test` are git-ignored, so no local override masks it in CI — it was **not** a JWT_SECRET issue.)

**Fix:** replaced the seed `password_hash` with a bcrypt hash that verifies `Password123!` (committed as "Fix seeded user password hashes"). Because CI seeds fresh each run, login now works.

**Final results:** backend **16/16 passing**; CI green; the release workflow builds and pushes the API image on `main`.

---

## 17. GitHub / Git Workflow

- **Git** = version control; **GitHub** = hosting + collaboration.
- **Workflow used (from history):** work on a **feature branch** → commit → push → open a **Pull Request** → CI runs → review → **merge to `main`**. Merged PRs visible: #2 (`feat/status-filter`), #3 (`feat/postgres-migrations`), #4 (`feat/api-postgres`), #5 (`feat/auth-jwt`).
- **Branches present:** `main` plus `feat/cancel-leave`, `feat/status-filter`, `feat/postgres-migrations`, `feat/api-postgres`, `feat/auth-jwt`.
- **Commits:** all 15 commits are authored by **anu2256**. Later work (client, testing, Docker/CI-CD, seed fix, pino logging) was committed directly on `main` as feature-style commits.

---

## 18. Branch Protection

**Status: Not verifiable from the repository contents.** Branch-protection rules / rulesets live in GitHub repo *settings*, not in the code, so they cannot be confirmed by inspecting the local repo. The history shows PR-based merges (which is consistent with a "require PR" rule), but the actual configuration of: *PR required, required approvals, required status checks (CI), up-to-date branch, force-push protection* — **cannot be proven here**. Confirm on GitHub (Settings → Branches/Rules) or via `gh api repos/anu2256/<repo>/rulesets`. Do not present specific rules as active without that check.

---

## 19. Deployment

**A. Local — ✅ Implemented.** Run Postgres, `npm run migrate` + `npm start` (server), `npm run dev` (client). Documented and working.

**B. Docker — ✅ Implemented.** `docker-compose.yml` builds and runs `db` + `api` + `web`; migrations run via `docker compose run --rm api npm run migrate`. Verified locally (db healthy, migrations applied, seed present).

**C. CI/CD artifact/release — ✅ Implemented.** `release.yml` builds and pushes the API image to GHCR on pushes to `main`.

**D. Cloud deployment — 🟡 Partially implemented (configured, not proven).** `client/vercel.json` contains a rewrite to a Render backend URL (`https://leaveflow-backend-99lq.onrender.com/api/...`) and `DEPLOYMENT.md` gives full Render/Vercel/Neon steps — but the **repository does not prove a live, running cloud deployment**. The frontend Docker/web image is deployable; a client cloud image build was not completed here. **No claim** is made that any specific environment is currently live.

---

## 20. SDLC

```
Requirements → Analysis → Design → Development → Testing → CI → Code Review → Build → Deployment → Maintenance
```
- **Requirements/SRS:** `docs/requirement.md` (user stories US-1…, acceptance criteria, MoSCoW-style priorities, open questions).
- **Analysis:** roles, leave rules, and state machine defined.
- **Design:** `docs/design.md`; API contract `docs/api.md`; DB schema in migrations.
- **Development:** React frontend + Express backend, feature by feature on branches.
- **Testing:** unit, API, component, E2E (section 11).
- **CI:** GitHub Actions run tests on every push/PR.
- **Code Review:** Pull Requests (#2–#5).
- **Build:** Docker images (API + web).
- **Deployment:** local + Docker Compose implemented; cloud partially configured.
- **Maintenance:** bug fixes (leave-duration, CI seed hash), structured logging added for observability.

---

## 21. Software Development Workflow

```
Requirement → Task → Feature branch → Development → Local testing → Commit → Push
→ Pull Request → CI (tests) → Code review → Approval → Merge to main → Release (image) → Deployment
```
This matches the repository: feature branches, PR merges into `main`, CI on each change, and a release workflow on `main`.

---

## 22. Security

**Implemented:**
- **Password hashing** — bcrypt (never store plaintext).
- **JWT** — signed, 8-hour expiry, verified on protected routes.
- **Role-based authorization** — `requireRole` + inline ownership/team checks.
- **SQL parameterization** — every query uses bound params (`$1,$2,…`) → protects against SQL injection.
- **Input validation** — required fields, dates, action/status enums, balance limits.
- **Protected endpoints** — all data endpoints require a valid token.
- **Environment variables** — `DATABASE_URL`, `JWT_SECRET` via env; **`.env` and `.env.test` are git-ignored** (not committed).
- **Log redaction** — pino logger redacts `authorization`/`cookie` headers so tokens don't appear in logs.

**Not implemented:** rate limiting, Helmet security headers, explicit CORS policy (avoided today via same-origin proxy), refresh tokens, password reset.

---

## 23. What I Personally Worked On

Based on git history, **every commit (15) is authored by `anu2256`** — i.e., you. There is no second contributor in the history, so ownership of the implemented work is attributable to you. By area (from commit messages and file history):

- **Backend:** Express skeleton, PostgreSQL API, routes (auth, leave-requests, balances, team, health), middleware.
- **Frontend:** React client and employee/manager/HR flows ("Build LeaveFlow React client and employee flows").
- **Database:** Postgres pool, migration runner, schema + seed, decision-note migration.
- **Authentication:** JWT auth and role authorization ("feat: add JWT authentication and role authorization").
- **Testing:** unit/API/component/E2E ("Add testing and quality checks").
- **Docker & CI/CD:** Dockerfiles, Compose, GitHub Actions ("Add Docker deployment and CI/CD pipelines").
- **Debugging/quality:** seed password-hash fix, leave-duration bug, structured logging.
- **Documentation:** `docs/`, `TEST_CASES.md`, `BUG_REPORT.md`, `DEPLOYMENT.md`.

*Uncertainty:* git history attributes authorship but cannot prove how much was independently written vs. guided/generated. State this honestly if asked.

---

## 24. Current Project Status

| Area | Status | Evidence |
|---|---|---|
| Frontend | ✅ Implemented | `client/src/*.jsx`, Vite build succeeds |
| Backend | ✅ Implemented | `server/src/app.js` + 5 route files |
| Database | ✅ Implemented | 3 migrations, `pg` pool, Compose `db` |
| Authentication | ✅ Implemented | JWT + bcrypt + `requireAuth`/`requireRole` |
| Role-based access | ✅ Implemented | EMPLOYEE/MANAGER/HR_ADMIN checks |
| Leave calculation | ✅ Implemented | `lib/leaveDays.js` + unit tests |
| Testing (unit/API/component/E2E) | ✅ Implemented | 16/16 + 2/2 + 1 E2E passed |
| Docker | ✅ Implemented | `server/Dockerfile`, `client/Dockerfile`, Compose |
| CI | ✅ Implemented | `.github/workflows/ci.yml` |
| CD / Release (GHCR) | ✅ Implemented | `.github/workflows/release.yml` |
| Structured logging | ✅ Implemented | `middleware/logging.js` (pino) |
| Branch protection | 🟡 Not verifiable | Lives in GitHub settings, not the repo |
| Cloud deployment | 🟡 Partially implemented | `vercel.json` + `DEPLOYMENT.md`; not proven live |
| Rate limiting / Helmet / CORS | ❌ Not implemented | No such middleware in code |
| Email/notifications, password reset, half-day, overlap check | ❌ Not implemented | Not in code |

---

## 25. Supervisor Interview Q&A

> Format — **Q**, **A (English)**, **සිංහල** (short).

**1. What is LeaveFlow?**
A: A role-based leave-management web app: employees apply for leave, managers approve, HR oversees; balances update automatically.
සිංහල: LeaveFlow කියන්නේ නිවාඩු කළමනාකරණ වෙබ් යෙදුමක්. සේවකයෝ නිවාඩු ඉල්ලනවා, කළමනාකරු අනුමත කරනවා, HR අධීක්ෂණය කරනවා.

**2. What problem does it solve?**
A: It replaces manual, error-prone email/spreadsheet leave handling with one auditable system.
සිංහල: email/spreadsheet වලින් කරන අවුල් සහගත ක්‍රමය වෙනුවට එක පද්ධතියක් දෙනවා.

**3. Who are the users?**
A: Employees, Managers, and HR Admins.
සිංහල: සේවකයෝ, කළමනාකරුවෝ, සහ HR පරිපාලකයෝ.

**4. What is the tech stack?**
A: React+Vite frontend, Node.js+Express API, PostgreSQL, JWT+bcrypt, Docker+Compose+Nginx, GitHub Actions.
සිංහල: React+Vite, Node.js+Express, PostgreSQL, JWT+bcrypt, Docker, GitHub Actions.

**5. Why REST APIs?**
A: Simple, standard, resource-based; easy for React to call and easy to test.
සිංහල: REST සරලයි, සම්මතයි; React එකට call කරන්න සහ test කරන්න ලේසියි.

**6. Which HTTP methods?**
A: GET, POST, PATCH, DELETE.
සිංහල: GET, POST, PATCH, DELETE.

**7. How does login work?**
A: Server checks the password with bcrypt, then returns a signed JWT the client sends on each request.
සිංහල: bcrypt වලින් password check කරලා JWT token එකක් දෙනවා; ඒක හැම request එකකම යවනවා.

**8. What is JWT?**
A: A signed token that proves identity without server-side sessions.
සිංහල: session නැතුව identity ඔප්පු කරන signed token එකක්.

**9. What is bcrypt?**
A: A one-way hashing function for passwords; the plain password is never stored.
සිංහල: password එක one-way hash කරන function එකක්; සැබෑ password එක save කරන්නේ නෑ.

**10. What is a Bearer token?**
A: The JWT sent in the `Authorization: Bearer <token>` header.
සිංහල: `Authorization: Bearer <token>` header එකේ යවන JWT එක.

**11. What is requireAuth?**
A: Middleware that verifies the JWT; no/invalid token → 401.
සිංහල: JWT verify කරන middleware; token නැත්නම් 401.

**12. What is requireRole?**
A: Middleware that checks the user's role; wrong role → 403.
සිංහල: role check කරන middleware; වැරදි role → 403.

**13. Difference between 401 and 403?**
A: 401 = not authenticated; 403 = authenticated but not allowed.
සිංහල: 401 = login නෑ; 403 = login තියෙනවා ඒත් අවසර නෑ.

**14. What are the roles?**
A: EMPLOYEE, MANAGER, HR_ADMIN.
සිංහල: EMPLOYEE, MANAGER, HR_ADMIN.

**15. How is a leave request created?**
A: POST /api/leave-requests → validate → compute working days → check balance → insert as PENDING.
සිංහල: POST /api/leave-requests → validate → working days ගණනය → balance check → PENDING විදියට insert.

**16. How does approval update the balance?**
A: In a transaction it locks the row, adds working days to `leave_balances.used_days`, and sets status APPROVED.
සිංහල: transaction එකක් තුළ row lock කරලා used_days වැඩි කරලා APPROVED කරනවා.

**17. Why a transaction for approval?**
A: To update status and balance atomically and avoid double-approval races.
සිංහල: status සහ balance එකට update කරන්න, double-approval වළක්වන්න.

**18. How are leave days counted?**
A: Inclusive dates, minus weekends, minus configured holidays.
සිංහල: දින දෙකම ඇතුළත්, weekend සහ holiday අඩු කරලා.

**19. Which holidays are configured?**
A: 2026-04-13, 04-14 (New Year), 05-01, 05-02 (Vesak).
සිංහල: 2026 අලුත් අවුරුද්ද (04-13/14) සහ වෙසක් (05-01/02).

**20. What database do you use?**
A: PostgreSQL, via the `pg` driver and a connection pool.
සිංහල: PostgreSQL, `pg` driver එකෙන්.

**21. What are the main tables?**
A: users, leave_types, leave_requests, leave_balances (+ schema_migrations).
සිංහල: users, leave_types, leave_requests, leave_balances.

**22. How do migrations work?**
A: `migrate.js` runs each `.sql` once, recording it in `schema_migrations`.
සිංහල: `migrate.js` හැම `.sql` එකක්ම එක පාරක් run කරලා `schema_migrations` වල save කරනවා.

**23. How do you prevent SQL injection?**
A: Parameterized queries (`$1,$2,…`) — never string-concatenate input.
සිංහල: parameterized queries පාවිච්චි කරනවා; input එක string එකට join කරන්නේ නෑ.

**24. What is Docker?**
A: A tool to package the app + its environment into an image that runs the same anywhere.
සිංහල: යෙදුම සහ environment එක image එකකට package කරන tool එකක්.

**25. Image vs container?**
A: Image = the recipe/template; container = a running instance of it.
සිංහල: image = template; container = ඒක run වෙන instance එක.

**26. What does Docker Compose do here?**
A: Runs db + api + web together with one file and shared networking.
සිංහල: db+api+web එකට එක file එකකින් run කරනවා.

**27. What is the DB health check?**
A: `pg_isready` marks the db "healthy"; the api waits for it via `depends_on`.
සිංහල: `pg_isready` වලින් db ready කියලා api ඉන්නවා.

**28. What is a Docker volume?**
A: Storage that persists database data even if the container is recreated.
සිංහල: container එක අලුත් වුණත් data රැඳෙන storage එකක්.

**29. Why `api:4000` in Nginx, not localhost?**
A: Inside a container localhost is itself; `api` is the Compose service name Docker DNS resolves.
සිංහල: container එක ඇතුළේ localhost කියන්නේ ඒකමයි; `api` කියන්නේ service නම.

**30. What does Nginx do?**
A: Serves the built React files and proxies `/api` to the backend; falls back to index.html for SPA routes.
සිංහල: React files serve කරලා `/api` backend එකට proxy කරනවා.

**31. What testing did you do?**
A: Jest unit + Supertest API, Vitest component, Playwright E2E.
සිංහල: Jest, Supertest, Vitest, Playwright.

**32. What are the current test results?**
A: Backend 16/16, frontend 2/2, E2E 1 passed.
සිංහල: Backend 16/16, frontend 2/2, E2E 1.

**33. How are tests isolated from real data?**
A: They use a separate `leaveflow_test` database and clean tables before tests.
සිංහල: වෙනම `leaveflow_test` database එකක් පාවිච්චි කරලා තියෙනවා.

**34. What is CI?**
A: Automatically building and testing code on every push/PR.
සිංහල: හැම push/PR එකකදීම කේතය build+test කිරීම.

**35. What is CD (delivery) here?**
A: On `main`, a Docker API image is auto-built and pushed to GHCR.
සිංහල: `main` එකට ගියාම API image එක GHCR එකට push වෙනවා.

**36. What happens on a Pull Request?**
A: CI runs test-api (with a Postgres service, migrate, Jest) and test-client (Vitest + build).
සිංහල: CI එකෙන් test-api සහ test-client run වෙනවා.

**37. What CI bug did you fix?**
A: 7 tests failed with 401 because the seeded password hash didn't match `Password123!`; I fixed the seed hash.
සිංහල: seed hash එක `Password123!` එකට match වුණේ නෑ; ඒක fix කළා.

**38. Why did it fail only in CI?**
A: CI seeds a fresh DB from the committed migration; local DBs already had a correct hash.
සිංහල: CI අලුත් DB එකක් seed කරනවා; local එකේ නිවැරදි hash එක තිබුණා.

**39. How is the code reviewed and merged?**
A: Feature branch → Pull Request → CI → review → merge to `main`.
සිංහල: feature branch → PR → CI → review → main එකට merge.

**40. Is it deployed to the cloud?**
A: Not proven. Docker + CI release are done; cloud config (Vercel/Render/Neon) exists as a guide but no live deployment is proven by the repo.
සිංහල: cloud එකට deploy කරලා කියලා ඔප්පු කරන්න බෑ; config සහ guide තියෙනවා.

**41. What security measures exist?**
A: bcrypt, JWT, RBAC, parameterized SQL, input validation, `.env` git-ignored, log redaction.
සිංහල: bcrypt, JWT, role checks, parameterized SQL, validation.

**42. What would you add next?**
A: Rate limiting, Helmet headers, email notifications, and a proven cloud deployment.
සිංහල: rate limiting, Helmet, email, සහ සැබෑ cloud deployment.

---

## 26. Quick Revision Sheet

- **Project:** LeaveFlow — role-based leave management
- **Purpose:** apply, approve, track leave; auto balances
- **Frontend:** React 19 + Vite (SPA), plain CSS
- **Backend:** Node.js + Express 5, REST, pino logging
- **Database:** PostgreSQL 16 (pg driver, SQL migrations)
- **Authentication:** JWT (8h) + bcrypt; requireAuth / requireRole
- **Testing:** Jest+Supertest (16/16), Vitest+RTL (2/2), Playwright (1)
- **Docker:** API image + multi-stage web (Nginx) + Compose (db/api/web, volume, health check)
- **CI/CD:** GitHub Actions CI (test-api + test-client) + release to GHCR
- **Deployment:** local ✅, Docker ✅, release ✅, cloud 🟡
- **Main roles:** EMPLOYEE, MANAGER, HR_ADMIN
- **Main APIs:** login, leave-requests (CRUD), balances, team/requests, health
- **Main features:** login, apply, cancel, approve/reject, balances, HR overview

**LOGIN FLOW:** form → POST /auth/login → bcrypt → JWT → localStorage → dashboard
**LEAVE APPLICATION FLOW:** form → POST /leave-requests → validate → working days → balance → PENDING
**APPROVAL FLOW:** PATCH /leave-requests/:id → role+team check → transaction → balance+status → APPROVED
**DOCKER FLOW:** build images → compose up (db healthy → api → web) → migrate → app on :8080
**CI/CD FLOW:** push/PR → CI (migrate+test) → merge main → release builds+pushes image to GHCR
**SDLC FLOW:** requirements → design → develop → test → CI → review → build → deploy → maintain

---

## 27. Important Commands

**Git**
```bash
git checkout -b feat/<name>
git add -A && git commit -m "feat: ..."
git push -u origin feat/<name>
# open a Pull Request on GitHub → merge to main
```

**Node / npm**
```bash
npm ci            # clean install from lockfile
npm install       # install/update deps
```

**Backend**
```bash
cd server
npm start                 # node src/server.js
npm run dev               # nodemon
npm run migrate           # apply migrations + seed
```

**Frontend**
```bash
cd client
npm run dev               # Vite dev server
npm run build             # production build → dist
npm run lint              # oxlint
```

**Testing**
```bash
npm test --prefix server          # Jest (16 tests)
npx jest --coverage               # (in server) coverage
npm test --prefix client          # Vitest (2 tests)
npx playwright test               # (in client) E2E
```

**Docker / Compose**
```bash
docker build -t leaveflow-api ./server
docker compose up -d
docker compose run --rm api npm run migrate
docker compose ps
docker compose logs -f api
docker compose down          # keep data
docker compose down -v       # delete db volume (destructive)
```

---

## 28. Final "Explain the Whole Project" Answer

**English (1–2 min):**
"LeaveFlow is a role-based leave-management web application I built to replace manual, email-and-spreadsheet leave handling. It has three types of users — employees, managers, and HR admins. Employees log in, see their leave balances, apply for leave, and can cancel a pending request; managers see their team's pending requests and approve or reject them with a note; HR admins get an organization-wide view. The frontend is React with Vite, the backend is a Node.js and Express REST API, and data is stored in PostgreSQL. Authentication is stateless: passwords are hashed with bcrypt, and on login the server issues a signed JWT that the client sends as a Bearer token; middleware called requireAuth and requireRole enforce who can do what. A key piece of logic calculates leave duration in working days, excluding weekends and configured Sri Lankan holidays, and updates balances safely inside a database transaction on approval. I tested it at four levels — Jest unit tests, Supertest API tests, Vitest component tests, and a Playwright end-to-end test — currently 16 backend, 2 frontend, and 1 E2E passing. Everything is containerized with Docker: an API image, a multi-stage Nginx image for the frontend, and a Docker Compose file that runs PostgreSQL with a health check, the API, and the web server together. GitHub Actions runs the tests on every push and pull request, and a release workflow builds and pushes the API image to the GitHub Container Registry when code reaches main. Along the way I fixed a real CI bug where a seeded password hash didn't match the test password, which failed only on CI's fresh database. Local and Docker deployment work today; cloud deployment is configured with a guide but not yet proven live."

**සිංහල:**
"LeaveFlow කියන්නේ මම හදපු role-based නිවාඩු කළමනාකරණ වෙබ් යෙදුමක්. email/spreadsheet වලින් කරන අවුල් සහගත ක්‍රමය වෙනුවට මේක එනවා. පරිශීලකයෝ තුන් දෙනෙක් ඉන්නවා — සේවකයෝ, කළමනාකරුවෝ, HR පරිපාලකයෝ. සේවකයෝ login වෙලා balance බලනවා, නිවාඩු ඉල්ලනවා, pending request එකක් cancel කරන්න පුළුවන්; කළමනාකරු team එකේ requests අනුමත/ප්‍රතික්ෂේප කරනවා; HR ට සම්පූර්ණ overview එකක් තියෙනවා. Frontend එක React+Vite, backend එක Node.js+Express REST API, data PostgreSQL වල save වෙනවා. Password bcrypt වලින් hash කරනවා; login වෙද්දී JWT token එකක් දෙනවා, ඒක Bearer token විදියට යවනවා; requireAuth සහ requireRole middleware වලින් අවසර පාලනය කරනවා. නිවාඩු දින ගණන weekday විදියට (weekend සහ holiday අඩු කරලා) ගණනය කරලා, approval එකේදී transaction එකක් තුළ balance update කරනවා. Jest, Supertest, Vitest, Playwright වලින් test කරලා තියෙනවා — දැන් backend 16, frontend 2, E2E 1 pass වෙනවා. Docker සහ Docker Compose වලින් db+api+web run කරනවා; GitHub Actions වලින් CI/CD තියෙනවා, main එකට ගියාම image එක GHCR එකට push වෙනවා. Local සහ Docker deployment වැඩ කරනවා; cloud deployment එකට config සහ guide තියෙනවා, ඒත් live කියලා ඔප්පු කරන්න බෑ."

---

*Prepared from the current repository state (`main` @ `0575104`). Where the repo cannot prove something (branch protection, live cloud deployment), it is marked accordingly rather than assumed.*
