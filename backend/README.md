# KAVACH backend

Phase 1 of the plan in `../docs/backend/ROADMAP.md`. Read
`../docs/backend/PHASE_0_AUDIT.md` and `../docs/backend/ARCHITECTURE_DECISION_RECORD.md`
before changing anything here — they explain what exists, what's simulated in the frontend
that this is meant to replace, and why each technology was chosen.

## What's here right now

- FastAPI app (`app/main.py`) with `/api/v1/health`, `/api/v1/ready`, `/api/v1/version`.
- PostgreSQL via SQLModel + async SQLAlchemy + Alembic. One table so far: `audit_events`.
- Nothing else yet — no auth, no agent, no model gateway. See the roadmap for what's next.

## Quickstart (Docker)

```bash
cp .env.example .env
# edit .env — set POSTGRES_PASSWORD and SESSION_SECRET to real values
cd ..
docker compose up -d postgres
docker compose run --rm backend-migrate
docker compose up -d backend
curl http://127.0.0.1:8000/api/v1/health
```

## Quickstart (no Docker — tests only)

```bash
python3 -m venv .venv && source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements-dev.txt
pytest -q
```

This runs the same 12 tests against an in-memory SQLite database. It proves the application
layer is correct; it does **not** prove the Alembic migration works against real Postgres —
that requires the Docker path above. See `docs/backend/PHASE_0_AUDIT.md` Section E.

## Layout

```
app/
  core/       configuration, logging, error handling, request middleware
  db/         async engine/session, SQLModel metadata registry
  models/     ORM tables (SQLModel)
  schemas/    pydantic request/response models
  services/   business logic, DB-agnostic of the HTTP layer
  api/v1/     route modules
migrations/   Alembic
tests/        pytest
```

## Conventions for whoever (or whichever session) works on this next

- Every setting is a field on `app.core.config.Settings` — never read `os.environ` directly
  anywhere else.
- Every route error should end up as the structured envelope in `app.schemas.errors`, not a
  raw traceback — raise `app.core.errors.AppError` or let FastAPI's own `HTTPException`/
  validation handling do it.
- A new model goes in `app/models/`, gets imported into `app/db/base.py`, and gets its own
  Alembic revision (`alembic revision --autogenerate -m "..."` once Postgres is reachable, or
  hand-write it like `0001_audit_events.py` if Postgres isn't reachable in your environment —
  say so in the migration's docstring if you did it that way).
- Don't expose a new table over HTTP before the auth/authorization layer that should gate it
  exists. `audit_service.py`'s docstring explains why this matters.
