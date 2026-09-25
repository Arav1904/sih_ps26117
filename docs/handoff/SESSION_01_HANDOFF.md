# KAVACH — Session 1 Handoff

## 1. Session information

- Session number: 1 (first backend session — prior sessions, per `docs/handoff/` and
  `CHANGELOG.md` already in the repo, were frontend-only)
- Date: 2026-09-23
- Current phase: Phase 0 complete; Phase 1 complete pending one live-Postgres verification
  (see Section 9)
- Project version: frontend `3.0.0` unchanged; backend `0.1.0-phase1` (new)

## 2. Work completed

1. Full repository audit against the master engineering prompt's Section 3 requirements —
   `docs/backend/PHASE_0_AUDIT.md`.
2. Architecture Decision Record covering all 10 major technology choices for the full backend
   — `docs/backend/ARCHITECTURE_DECISION_RECORD.md`.
3. Phase-by-phase roadmap tracking — `docs/backend/ROADMAP.md`.
4. Phase 1 backend foundation, implemented and tested (see file list below):
   - FastAPI application factory with CORS, request-ID correlation middleware, structured
     JSON error responses for every exception path.
   - Centralized, fail-fast, typed configuration (`Settings`), overridable via `.env`.
   - Local-only structured JSON logging.
   - `/api/v1/health`, `/api/v1/ready` (real DB check), `/api/v1/version`.
   - Async SQLAlchemy engine/session plumbing.
   - First schema piece: `audit_events` table, its Alembic migration, and a tested service
     layer (`record_event` / `list_events`) — deliberately not yet exposed over HTTP (no auth
     exists to gate it — see the docstring in `audit_service.py`).
   - Docker Compose stack (Postgres + backend) and a non-root backend Dockerfile.
   - 12 pytest tests, all passing (see Section 8 for exact output).
5. Two real bugs found and fixed by the test suite itself, not shipped silently:
   - `AuditEvent` could not have a field literally named `cls` — it collides with SQLModel's
     implicit `__new__(cls, ...)` parameter. Renamed the ORM column to `category`; the
     `record_event()`/`list_events()` call sites still use `cls=` as the keyword so the domain
     vocabulary (`AuditClass`) stays consistent everywhere else. The *wire* contract (what the
     frontend's `AuditEvent.cls` expects) is unaffected — that mapping happens at the Phase 2
     schema layer, which doesn't exist yet.
   - A config test assumed pydantic v2 wraps a `model_post_init` validation failure in
     `ValidationError`. It doesn't — it's a plain `ValueError`. Fixed the test's assertion, not
     the (correct) production code.

## 3. Files changed

**Added** (all new — no existing file was touched or deleted this session):
```
backend/                                    (entire directory, new)
  app/__init__.py
  app/main.py
  app/core/{__init__,config,errors,logging,middleware}.py
  app/db/{__init__,base,session}.py
  app/models/{__init__,audit}.py
  app/schemas/{__init__,errors,system}.py
  app/services/{__init__,audit_service}.py
  migrations/{env.py,script.py.mako}
  migrations/versions/0001_audit_events.py
  tests/{__init__,conftest,test_config,test_system_routes,test_audit_service}.py
  alembic.ini
  pytest.ini
  requirements.txt
  requirements-dev.txt
  .env.example
  Dockerfile
docker-compose.yml
docs/backend/PHASE_0_AUDIT.md
docs/backend/ARCHITECTURE_DECISION_RECORD.md
docs/backend/ROADMAP.md
docs/handoff/SESSION_01_HANDOFF.md
docs/handoff/CURRENT_HANDOFF.md              (points here)
```

**Modified:**
```
.gitignore   — added backend/.env, backend/data/, __pycache__, .pytest_cache, venv patterns
CHANGELOG.md — new entry for this session
```

**Deleted:** none.

**Not touched:** everything under `src/`, `tests/` (the existing frontend Vitest-style
scripts), `docs/architecture.md`, `docs/security.md`, `docs/demo.md`, `FINAL_*.md`, `README.md`.
The frontend behaves identically to before this session in every way — it still runs entirely
on demo data, as it did before Phase 1.

## 4. Architecture decisions

See `docs/backend/ARCHITECTURE_DECISION_RECORD.md` in full. Summary: FastAPI, PostgreSQL via
SQLModel/SQLAlchemy 2.0 async + Alembic, pgvector (not Qdrant) for retrieval, Ollama (not vLLM)
as the initial model-serving target behind a provider-agnostic gateway interface, a custom
bounded agent loop (not LangGraph), Docker sandbox with no network namespace, local
bcrypt+session auth behind a swappable provider interface, Docker Compose (not Kubernetes),
REST + SSE for the frontend contract.

## 5. Database status

- Migrations: one, `0001_audit_events.py` — creates the `audit_class` enum and the
  `audit_events` table with 7 indexes.
- Schema changes: `audit_events` only. No `users`, `conversations`, `runs`, etc. yet
  (Phase 2/4).
- Seed status: no seed data exists. Development/demo seed data is Phase 2 work (it needs the
  `users` table to seed the three demo accounts against, per Section 7: "seeded
  development/demo data").
- **Migration has not been run against a real PostgreSQL instance yet** — this sandbox has no
  `psql`/`pg_config`/Docker available. See Section 9.

## 6. Backend status

- Endpoints implemented: `GET /api/v1/health`, `GET /api/v1/ready`, `GET /api/v1/version`.
  That's the complete list — genuinely, not abbreviated.
- Services implemented: `audit_service.record_event()` / `.list_events()` (DB-backed, no HTTP
  route yet).
- Integrations: none yet (no model gateway, no sandbox, no OCR — those are Phases 5, 6, 8).

## 7. Frontend status

Unchanged. No integration work has started (Phase 3). `src/services/*.ts` still serve demo
data from `src/data/corpus.ts`/`scenarios.ts` exactly as documented in
`docs/backend/PHASE_0_AUDIT.md` Section C.

## 8. Tests — exact commands and actual results

```
$ cd KAVACH && npm install --no-audit --no-fund
added 133 packages, 3s

$ npm run typecheck
tsc -b → exit 0

$ npm run build
✓ built in 2.28s, 84 modules

$ npm test
all routes render clean
all behaviour checks pass (33/33)
tests/ooxml-check.mjs → written
tests/offline-check.mjs → all checks passed

$ cd backend && pip install -r requirements-dev.txt
(clean install, no conflicts)

$ python3 -m pytest -q
............
12 passed in 0.33s
```

No number in this document was invented — every one above is pasted from an actual command
run in this session (see the raw tool transcript if you need to double-check any of them).

## 9. Known issues

1. **The Alembic migration has never run against real PostgreSQL.** This is the most important
   open item. Everything in `backend/app/models/audit.py` and
   `backend/migrations/versions/0001_audit_events.py` is believed correct (it follows standard
   SQLAlchemy/Alembic patterns and the SQLite-backed tests exercise the same model
   definitions) but "believed correct" is not the same as "verified," and Section 3.E of the
   master prompt is explicit that the two must not be conflated. First action of the next
   session with Docker available.
2. `/api/v1/ready` currently only checks the database. As Phase 5/6/8 add the model gateway,
   OCR service, and sandbox, their own reachability checks should be added to the same
   endpoint's `checks` list — the `ReadinessCheck` schema already supports an arbitrary list,
   so this is additive, not a rework.
3. FastAPI's interactive docs (`/docs`, `/redoc`) are enabled unconditionally right now. Fine
   for development/demo; revisit whether they should be disabled by default in
   `ENVIRONMENT=sovereign` before a real deployment (Section 37: "debug endpoints" as a
   hardening checklist item).
4. No CI workflow exists yet to run either test suite automatically on push. Not part of
   Phase 1's stated goal ("backend starts cleanly and connects to PostgreSQL") but worth adding
   early in Phase 2 so the two-bugs-caught-by-tests pattern from this session keeps happening
   automatically rather than depending on a human/session remembering to run `pytest`.

## 10. Next session

**Start here, in this order:**

1. Bring up Docker (see Section 11 below), run `alembic upgrade head` against real Postgres,
   confirm `GET /api/v1/ready` returns `{"ready": true}` against it. Update
   `docs/backend/PHASE_0_AUDIT.md` Section E with the real output once this is done — don't
   silently assume it worked.
2. Begin **Phase 2** (auth + persistence): `backend/app/models/user.py` (id, email,
   password_hash, role, created_at), `backend/app/security/passwords.py` (bcrypt hash/verify),
   `backend/app/security/session.py` (signed cookie issue/verify), `POST /api/v1/auth/login`,
   `POST /api/v1/auth/logout`, `GET /api/v1/auth/me`, a `get_current_user` FastAPI dependency,
   and a new Alembic migration (`0002_users_and_sessions.py`).
3. Seed the same three demo accounts the frontend already expects
   (`engineer@kavach.local` / `auditor@kavach.local` / `admin@kavach.local`, all
   `Kavach@2026` — see `src/services/auth.ts`) so Phase 3's frontend integration has something
   real to authenticate against without changing the demo credentials judges already have
   memorized.
4. Once users exist, add `backend/app/models/conversation.py` /
   `backend/app/models/message.py` and finally expose `GET /api/v1/audit` (auth-gated, role
   filtered per Section 24) — this closes out the one deferred item from this session.
5. Write `docs/backend/PHASE_0_AUDIT.md`-style honesty into Session 2's handoff: if something
   wasn't run, say so; if a test is sqlite-only, say so.

## 11. Manual setup required

To continue from exactly where this session stopped, on a machine with Docker:

```bash
cd KAVACH/backend
cp .env.example .env
# edit .env: set POSTGRES_PASSWORD and SESSION_SECRET to real values
#   (generate one: python -c "import secrets; print(secrets.token_urlsafe(48))")
cd ..
docker compose up -d postgres
docker compose run --rm backend-migrate      # runs `alembic upgrade head`
docker compose up -d backend
curl http://127.0.0.1:8000/api/v1/health
curl http://127.0.0.1:8000/api/v1/ready      # should now show {"ready": true, ...}
```

**Windows PowerShell equivalent:**

```powershell
cd KAVACH\backend
Copy-Item .env.example .env
# edit .env in a text editor: POSTGRES_PASSWORD and SESSION_SECRET
cd ..
docker compose up -d postgres
docker compose run --rm backend-migrate
docker compose up -d backend
Invoke-RestMethod http://127.0.0.1:8000/api/v1/health
Invoke-RestMethod http://127.0.0.1:8000/api/v1/ready
```

To run the backend test suite locally without Docker (same sqlite-backed suite this session
ran):

```bash
cd KAVACH/backend
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
pytest -q
```

No secrets are required for the test suite — `tests/conftest.py` sets a test-only
`SESSION_SECRET` and an in-memory SQLite `DATABASE_URL` automatically.
