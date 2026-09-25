# KAVACH — Phase 0 Audit Report

Session 1 · 2026-09-23 · Auditor: Claude (acting as principal architect for this engagement)

This is the audit required by Section 2/3 of the master engineering prompt, before any
backend implementation began. It covers the repository supplied as `KAVACH_FINAL.zip`
(package.json version `3.0.0`) and the two SIH26 presentation decks supplied alongside it.

---

## A. Current architecture

**Frontend framework.** React 18.3 + TypeScript 5.6, built with Vite 5.4. Routing is
`react-router-dom` v6 (`BrowserRouter`, 18 route components under `src/pages/`).
No server-side rendering, no meta-framework (no Next.js/Remix).

**Build system.** `vite build` after `tsc -b`. Output is a single JS chunk (no route-based
code splitting) plus bundled `@fontsource` woff2/woff files — this is why the product can
run genuinely offline (Section 28): fonts are shipped, not fetched from Google Fonts.

**Routing.** Two top-level trees: public marketing/proof routes (`/`, `/how`, `/capabilities`,
`/security`) and an authenticated `/app/*` tree (dashboard, agent run, document task,
knowledge, sandbox, routing, sovereignty, ledger, system, archive, night-ops). Auth-gating is
a `RequireAuth` wrapper that redirects to `/login` if `auth.isAuthenticated()` is false — this
lives entirely in the browser (see Auth, below).

**State management.** No Redux/Zustand/etc. State is a set of hand-rolled singleton "service"
classes in `src/services/*.ts`, each exposing a `subscribe`/`getSnapshot` pair consumed via
React's `useSyncExternalStore`, plus one larger `src/state/store.ts` (204 lines) that drives
the deterministic agent-run timeline (`start`, `cancel`, per-step state transitions) for the
two demo scenarios defined in `src/data/scenarios.ts`.

**Service abstraction.** Nine services under `src/services/`: `agent`, `artifact`, `audit`,
`auth`, `knowledge`, `modelRouter`, `networkPolicy` (+ `securityMonitor.ts`, a compatibility
re-export), `ocr`. Every one of them is a plain TypeScript class operating on data that is
either hard-coded in `src/data/corpus.ts` / `src/data/scenarios.ts`, or held in
`localStorage`/in-memory only. **None of them call a network API.** This is confirmed by
reading every file in `src/services/`, not inferred from naming.

**Data model.** `src/types.ts` (143 lines) is the single file that defines every shape the UI
renders: `ModelRecord`, `KnowledgeDoc`, `Finding`, `RoutingDecision`, `AgentStep`, `Scenario`,
`Artifact`, `RunRecord`, `AuditEvent`, `BlockedCall`, `OcrPage`. Its own header comment already
states the intended role correctly: *"Contracts shared by the UI and the service layer. When
the FastAPI backend replaces the mocks, these types are what it must emit."* Section C below
turns this into the actual API contract.

**Current authentication.** `src/services/auth.ts` is explicitly and repeatedly documented, in
its own header comment, as demonstration-only: three hard-coded accounts
(`engineer@kavach.local`, `auditor@kavach.local`, `admin@kavach.local`, all password
`Kavach@2026`), a `demo@kavach.local` alias, and a signup flow that appends new accounts to
`localStorage` in plaintext. No password hashing, no server, no token. The file's own comment
says: *"No backend was added for this. Adding one would have described an architecture the
prototype does not have."* This audit's job is to now build that architecture.

**Current network guard (`networkPolicy.ts`, 215 lines).** This is the one genuinely real
piece of engineering in the prototype, not a simulation of one. It monkey-patches `fetch`,
`XMLHttpRequest.prototype.open`, `WebSocket`, and `navigator.sendBeacon` before React mounts,
classifies every outbound call as `local` (loopback hostnames, `file:`/`blob:`/`data:`/`unix:`
schemes, or same-origin) or `external`, refuses the external ones before a packet is sent, and
logs both outcomes to the audit service. Its own header comment is explicit about its limits:
*"WHAT THIS IS NOT: a host firewall. A browser cannot police its operating system."* Sections
26 and 27 of the master prompt (backend/container/host-level enforcement) are the real
production counterpart this module anticipates but cannot itself provide.

**Current audit mechanism.** `src/services/audit.ts` (30 lines): an in-memory ring buffer
(last 400 events), `useSyncExternalStore`-compatible, with its own header comment stating the
target state directly: *"In deployment this is a PostgreSQL table; here it lives in memory."*

**Current artifact generation.** `src/services/artifact.ts` + `src/lib/ooxml.ts` (147 lines).
This is real, working OOXML generation — `buildDocx`/`buildXlsx` produce byte-valid
`.docx`/`.xlsx` files client-side from structured `DocBlock`/row data, verified by
`tests/ooxml-check.mjs` (part of the existing test suite; re-run in Section E below). The
*content* of the generated approval note and cost estimate is fixed demo content
(`src/data/corpus.ts`: `FINDINGS`, `ESTIMATE`, `FIXED_CODE`) — the file-writing mechanism is
real, the source data behind it is not.

**Current demo simulation.** `src/data/scenarios.ts` (159 lines) + `src/data/corpus.ts` (138
lines) define two fixed scenarios ("inspection", "code") as literal arrays of `AgentStep`
objects with hard-coded `durationMs`, routing decisions, and OCR confidence numbers. `store.ts`
plays these back on a `setTimeout` cadence; nothing is computed, retrieved, or inferred at
runtime.

**Current backend presence.** None. Confirmed by the absence of any `backend/`, `api/`,
server framework dependency, or non-`localhost`-documentation reference to a running service
anywhere in `package.json`, `src/`, or `docs/` prior to this session's `backend/` addition.

**Existing backend seams.** The service-class boundary itself (`src/services/*.ts`) is the
seam. Every service is already narrow enough to become a thin API-client wrapper without the
pages that consume it changing — this is the basis for the Section C contract table and for
Phase 3 (frontend/backend integration) not requiring a page-level rewrite.

---

## B. Reality classification

| Capability | Current state | Real / Simulated / Partial / Missing | Integration target |
|---|---|---|---|
| Authentication | 3 hard-coded accounts, localStorage session, no hashing | **Simulated** | Real server-side auth (Section 23): bcrypt-hashed local credentials + session cookie now; LDAP/OIDC adapter interface reserved for later |
| Chat | No chat UI or endpoint exists yet; `Work.tsx`/`Dashboard.tsx` show a command bar that starts one of two fixed scenarios | **Missing** (as a real chat) | Phase 3/4: `/api/v1/conversations`, `/api/v1/messages`, streaming |
| Agent execution | Deterministic `setTimeout` playback of two fixed step arrays | **Simulated** | Phase 4: real bounded planner-executor loop |
| Model routing | `modelRouter.route(scenario)` returns the scenario's hard-coded `RoutingDecision[]` | **Simulated** | Phase 5: capability-based router against a real model registry |
| OCR | `OCR_PAGES` is a hard-coded array with fixed confidence numbers | **Simulated** | Phase 6: real OCR (Surya + Tesseract fallback, per the pitch deck) |
| Vision | Not implemented; P&ID image is referenced only as a filename in scenario data | **Missing** | Phase 6 |
| RAG | `knowledge.search()` does in-memory `Array.filter` over 6 hard-coded `KnowledgeDoc` rows; no embeddings, no vector search | **Simulated** | Phase 7: pgvector-backed retrieval with real citations |
| Sandbox | `Sandbox.tsx` displays a fixed "7/7 tests pass" narrative from `FIXED_CODE`; no code is executed anywhere | **Simulated** | Phase 8: real containerized, networkless execution |
| Artifacts | OOXML *generation* is real and tested; *content* is fixed demo data, and files exist only in-browser (`Blob` + object URL), never persisted server-side | **Partial** | Phase 9: same OOXML writer, fed by real run data, persisted server-side with metadata |
| Audit | Real in-memory ring buffer (400 events), lost on refresh | **Partial** | **Phase 1 delivers the persistence half of this today** — see below |
| Egress control | Real, working browser-level interception and classification; explicitly not a host/container boundary | **Partial** | Layers 2 through 6 of Section 26 (backend, container, host, model server, sandbox isolation) — Phase 10 |
| Database | None — `localStorage` is the only persistence | **Missing** | **Phase 1 delivers PostgreSQL connectivity + first migrated table today** |
| Persistence | `localStorage` only (session, locally-created demo accounts) | **Missing** (as authoritative state) | Phase 2 |

**This session's actual delivery against the table above:** the *Audit* row moves from
"in-memory only" to "a real, migrated PostgreSQL table with a tested service layer" (see
`backend/app/models/audit.py`, `backend/migrations/versions/0001_audit_events.py`). The
*Database* row moves from Missing to "backend connects to it, migrations run against it" —
contingent on the not-yet-executed verification named in Section E. Every other row is
unchanged by this session and is not claimed otherwise.

---

## C. Existing frontend contracts

Read directly from the files named in Section 3.C of the master prompt:

| Frontend service | What it currently returns | Backend component it must become | Notes |
|---|---|---|---|
| `src/types.ts` | N/A — the contract itself | `backend/app/schemas/*.py` (pydantic) | Types are copied 1:1 where the domain matches; `AuditEvent.cls` needed a rename at the ORM layer only (see below) — the wire contract stays `cls`. |
| `src/services/agent.ts` | `store` playback of `SCENARIOS[key]` | `POST /api/v1/runs`, `GET /api/v1/runs/{id}/events` (SSE) | `agent.progress()`/`currentIndex()` become derived from real `RunRecord.stepStates` returned by the API, not recomputed client-side from a local array. |
| `src/services/modelRouter.ts` | `SCENARIOS[scenario].routing` | `GET /api/v1/models`, routing decision embedded in run events | Model registry becomes config-driven (Section 14), not scenario-driven. |
| `src/services/knowledge.ts` | In-memory filter over `KNOWLEDGE` | `GET /api/v1/knowledge/search`, `GET /api/v1/knowledge/collections` | Needs pgvector + embeddings (Phase 7) before this is meaningfully different from today. |
| `src/services/ocr.ts` | `OCR_PAGES` constant | `POST /api/v1/files/{id}/ocr` result, or embedded in run events | Confidence threshold (`OCR_THRESHOLD = 0.85`) is already a named constant — carries forward unchanged into the backend's OCR service config. |
| `src/services/artifact.ts` | Client-side `Blob` download of locally-generated OOXML | `GET /api/v1/artifacts`, `GET /api/v1/artifacts/{id}/download` | `buildDocx`/`buildXlsx` in `src/lib/ooxml.ts` are explicitly **preserved** per Section 21 ("do not casually rewrite `src/lib/ooxml.ts`") — they move server-side in Phase 9 essentially unchanged, fed real data instead of `corpus.ts`. |
| `src/services/auth.ts` | localStorage session object | `POST /api/v1/auth/login`, `POST /api/v1/auth/logout`, `GET /api/v1/auth/me` | Phase 2. The three demo roles (`engineer`/`auditor`/`admin`) and their route-gating meaning carry forward unchanged — only the credential-checking mechanism changes. |
| `src/services/audit.ts` | In-memory ring buffer | `backend/app/services/audit_service.py` (**exists now**) + a Phase-2, auth-gated `GET /api/v1/audit` route | Kept unexposed over HTTP this session — see the "why" note in the module's own docstring; exposing an unauthenticated data endpoint before auth exists would itself be a Section 24 violation. |
| `src/services/networkPolicy.ts` | Browser-only interception | No direct backend equivalent — becomes Layers 2 through 6 of Section 26 (backend egress allowlist, container network policy, host firewall, sandbox `--network none`) | Not a REST endpoint; a deployment/infrastructure concern, addressed starting Phase 10. |

What can be preserved as-is: **all of `src/lib/ooxml.ts`, the full `src/types.ts` vocabulary,
the role model (`engineer`/`auditor`/`admin`), the seven-stage spine (`StageKey`), and the
service-class boundary itself.** Nothing about the visual layer is touched this session.

---

## D. Dependency and reproducibility audit

Executed in this session's sandbox, 2026-09-23:

```
node -v   → v22.22.2
npm -v    → 10.9.7
npm install --no-audit --no-fund     → added 133 packages, 3s, 0 vulnerabilities reported
npm run typecheck (tsc -b)           → exits 0, no errors
npm run build (tsc -b && vite build) → built in 2.28s, 84 modules, single chunk
```

Build output (this session, for comparison against `docs/BASELINE.md`'s prior numbers):

| Asset | Size |
|---|---|
| `dist/index.html` | 0.79 kB |
| `dist/assets/index-*.css` | 42.59 kB (gzip 8.46 kB) |
| `dist/assets/index-*.js` | 353.42 kB (gzip 110.21 kB) |
| bundled font files | 14 files, 13.8 to 28.2 kB each |

No `--legacy-peer-deps` or force flags were needed or used. `package-lock.json` resolved
cleanly against the supplied `package.json` with no version conflicts. This baseline is
trustworthy — Phase 1 backend work did not need to touch anything under `src/`, and did not.

**Backend toolchain (new this session):** Python 3.12.3. `backend/requirements.txt` pins
FastAPI 0.115.6, SQLModel 0.0.22, SQLAlchemy 2.0.36, Alembic 1.14.0, asyncpg 0.30.0, pydantic
2.10.3 / pydantic-settings 2.6.1. All installed cleanly from PyPI with no conflicts. Versions
were pinned to specific patch releases current as of this session rather than left floating,
so a future `pip install -r requirements.txt` reproduces the same environment.

---

## E. Existing test baseline — what was actually executed

**Frontend** (unchanged from the prior baseline in `docs/BASELINE.md`, re-run this session to
confirm reproducibility rather than assumed):

```
$ npm test
all routes render clean (jsdom route census)
all behaviour checks pass (33 checks: auth, egress classification, run lifecycle,
  ledger growth, artifact download, logout, no console errors)
tests/ooxml-check.mjs -> "written" (docx/xlsx bytes are valid OOXML)
tests/offline-check.mjs -> all checks passed (no absolute src/href, no external url(),
  every URL literal in the built JS accounted for)
```
All green, actually executed this session, output pasted above from the real run.

**Backend (new this session):**

```
$ cd backend && python3 -m pytest -q
............
12 passed in 0.33s
```

Also executed and passing: a full `py_compile` pass over every `.py` file in `app/`,
`migrations/`, and `tests/` (28 files), and an app-boot smoke test confirming `create_app()`
constructs without error and the OpenAPI schema (`/openapi.json`) is servable.

**What was NOT executed, and why — read this before trusting the 12/12 number as more than it
is.** This sandbox has neither a Docker daemon nor a PostgreSQL server available
(`which docker`, `which docker-compose`, `which psql`, `which pg_config` all return nothing).
The 12 backend tests therefore run the exact same SQLModel ORM models against an in-memory
SQLite database, not PostgreSQL. This proves the application layer (config validation, FastAPI
routing, error handling, the audit service's read/write logic) is correct. **It does not
prove** that `migrations/versions/0001_audit_events.py` runs cleanly against real Postgres, or
that the `asyncpg` driver path works, or that the Postgres-native `audit_class` ENUM type
behaves as written. Two bugs were in fact caught by the SQLite-backed suite before being
shipped (see `CHANGELOG.md` and the session handoff): a field-naming collision between the ORM
model and Python's implicit `cls` parameter, and an incorrect assumption in a config test about
how pydantic v2 surfaces a `model_post_init` validation failure. Both were root-caused and
fixed, not skipped or weakened, per Section 50.

**The required, not-yet-run verification** is: bring up `docker compose up -d postgres`, run
`alembic upgrade head` against it, and confirm the FastAPI app starts with `DATABASE_URL`
pointed at that real instance and `GET /api/v1/ready` reports `{"ready": true}`. This is the
first item in the Session 1 handoff's "Manual setup required" section — it requires Docker,
which this execution environment does not have.
