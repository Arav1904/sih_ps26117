# KAVACH — Backend Implementation Roadmap

Tracks the 12 phases from Section 48 of the master engineering prompt against this specific
codebase. Status is updated at the end of every session — see
`docs/handoff/CURRENT_HANDOFF.md` for which session last touched which phase.

| Phase | Goal | Status |
|---|---|---|
| 0 | Audit + reproducible baseline + architecture decision | **Done** — `PHASE_0_AUDIT.md`, `ARCHITECTURE_DECISION_RECORD.md` |
| 1 | Backend foundation: FastAPI, config, health/readiness, structured logging, PostgreSQL connection, migrations, base schema, Docker/dev environment | **Done this session, pending live-Postgres verification** — see below |
| 2 | Auth + persistence: users, roles, sessions, secure login/logout, authorization, conversations, messages, persistent audit ledger | Not started |
| 3 | Frontend/backend integration: API client, auth integration, real chat requests, streaming, errors, loading, cancellation | Not started |
| 4 | Agent orchestration: run lifecycle, planning, bounded loop, tool registry, step events, retries, cancellation, verification states | Not started |
| 5 | Model gateway + routing: registry, local model adapter (Ollama, AD-4), health, capability metadata, task classifier, task-aware routing | Not started |
| 6 | Files + OCR + multimodal: uploads, safe storage, PDF processing, OCR, vision, confidence, human review, provenance | Not started |
| 7 | RAG / knowledge base: ingestion, chunking, embeddings, pgvector search (AD-3), retrieval, citations, grounding | Not started |
| 8 | Sandbox + code agent: isolated execution (AD-6), networkless runtime, limits, test runner, patch/repair, result capture | Not started |
| 9 | Artifacts: real DOCX/XLSX/code artifacts server-side (reusing `src/lib/ooxml.ts`'s approach), storage, downloads, metadata, verification, audit linkage | Not started |
| 10 | Sovereignty hardening: backend network restrictions, sandbox isolation, host/container controls, no-cloud runtime verification, secret audit, dependency audit | Not started (Phase 1 scaffolding — `SOVEREIGN_MODE` flag — exists; not yet enforced anywhere) |
| 11 | Frontend cleanup and optimization | Not started — and per Section 44, explicitly not before backend functionality exists |
| 12 | Full integration + release candidate: full test matrix, clean-machine reproduction | Not started |

## What "Phase 1 done" means precisely, and what it does not

**Done and verified this session (see `PHASE_0_AUDIT.md` Section E for the actual commands
run):**
- FastAPI app factory (`backend/app/main.py`) with CORS, request-ID correlation middleware,
  and a structured JSON error envelope for every exception path (validation, HTTP, unhandled).
- Centralized, fail-fast typed configuration (`backend/app/core/config.py`) — no module reads
  `os.environ` directly; a placeholder `SESSION_SECRET` is refused outside development mode.
- Structured local-only JSON logging, no external telemetry (`backend/app/core/logging.py`).
- `/api/v1/health` (pure liveness), `/api/v1/ready` (real database connectivity check),
  `/api/v1/version`.
- Async SQLAlchemy engine/session management (`backend/app/db/session.py`).
- First real schema piece: the `audit_events` table (`backend/app/models/audit.py`) plus its
  Alembic migration (`backend/migrations/versions/0001_audit_events.py`) and a tested
  service layer (`backend/app/services/audit_service.py`) — not yet exposed over HTTP (see
  the module's own docstring for why: no auth exists yet to gate it).
- Docker Compose (`docker-compose.yml`) and a non-root backend `Dockerfile`.
- 12 backend unit/integration tests, all passing against an in-memory SQLite substitute for
  Postgres (see the audit report's honest caveat about what this does and does not prove).

**Explicitly NOT done, so a future session does not have to rediscover it by reading code:**
- The migration has never been run against real PostgreSQL. This is the single most important
  outstanding verification — see `docs/handoff/SESSION_01_HANDOFF.md`, "Manual setup required."
- No users/roles/sessions tables exist yet (Phase 2).
- No frontend code was touched. `src/services/*.ts` still return demo data exactly as they did
  before this session; nothing in the running product looks or behaves differently yet.
- No route is authenticated, because auth doesn't exist yet — this is why the audit ledger has
  a working service layer but no HTTP route in front of it.
