# Changelog

## backend-0.1.0-phase1 — 2026-09-23

First backend session. Frontend is untouched and unchanged (still `3.0.0`, still runs entirely
on demo data). See `docs/backend/PHASE_0_AUDIT.md`, `docs/backend/ARCHITECTURE_DECISION_RECORD.md`
and `docs/handoff/SESSION_01_HANDOFF.md` for full detail.

### Added
- `backend/` — FastAPI application: typed fail-fast configuration, structured local-only JSON
  logging, request-ID correlation middleware, a structured error envelope for every exception
  path, `/api/v1/health`, `/api/v1/ready` (real DB check), `/api/v1/version`.
- First real database schema: the `audit_events` table (PostgreSQL, via SQLModel + Alembic
  migration `0001_audit_events.py`) and a tested `audit_service` (`record_event`/`list_events`).
  Not yet exposed over HTTP — no auth exists yet to gate it.
- `docker-compose.yml` (Postgres + backend, loopback-only ports) and a non-root
  `backend/Dockerfile`.
- `backend/.env.example`, fully documented.
- 12 backend tests (pytest), all passing against an in-memory SQLite substitute for Postgres —
  see the audit report for exactly what that does and does not prove.
- `docs/backend/PHASE_0_AUDIT.md`, `docs/backend/ARCHITECTURE_DECISION_RECORD.md`,
  `docs/backend/ROADMAP.md`, `docs/handoff/SESSION_01_HANDOFF.md`.

### Fixed
- (Backend, pre-release — caught by this session's own test suite before shipping) A field
  named `cls` on the `AuditEvent` ORM model collided with SQLModel's implicit constructor
  parameter of the same name; renamed the column to `category` internally, wire contract
  unaffected.

### Testing
- Frontend baseline re-confirmed unchanged this session: `npm run typecheck`, `npm run build`,
  `npm test` (33 behaviour checks + route census + OOXML check + offline check) all pass.
- Backend: `pytest -q` → 12 passed. **Not yet run:** the Alembic migration against a real
  PostgreSQL instance (no Docker/Postgres available in this session's sandbox) — flagged as the
  first task for the next session, not silently assumed to work.

## 3.0.0 — 2026-09-16

A complete product, UI and UX rebuild of the SIH 2026 PS26117 prototype. The service layer, the OOXML writer,
the seeded telemetry and the fictional corpus were kept; the visual layer, the information architecture and
the agent presentation were rebuilt.

### One product instead of four
- Console black / off-white / burgundy is now the identity on every route. Landing, Night Ops and Archive no
  longer look like separate websites.
- Purple survives as a Night Ops marker (one band edge, one dot). Warm survives as a single hero glow. Neither
  owns a background anywhere.
- New token system: `src/styles/tokens.css` — colour, type, spacing, radius, elevation, motion, layers.
- One `<Shell>` (black top bar + footer) wraps all 19 screens; signed out it carries marketing navigation,
  signed in it carries product navigation.

### Air-gapped for real
- **Removed the Google Fonts dependency.** Archivo, JetBrains Mono and Courier Prime now ship in the bundle
  via `@fontsource` (SIL OFL). The built page fetches nothing.
- New `tests/offline-check.mjs` fails the suite on any external `src`, `href`, `url()` or undocumented URL
  literal in `dist/`.

### The agent is the centrepiece
- `AgentTimeline` — staged, animated, with an active glow, check marks, tool icons, per-step *Why this step?*
  and raw tool output behind a disclosure.
- New `WorkflowSpine`: **INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT**, used on the landing
  page, the dashboard, the agent run and the sandbox.
- Every `AgentStep` gained a `stage` and a plain-language `why`; every step title was rewritten from
  "Transcribe the scanned pages" to "Turn the scanned pages into text".

### New screens
- `/app` dashboard — greeting, Ask KAVACH command bar, four quick tasks, local-only status strip, active work,
  recent work, waiting-on-you, node activity.
- `/app/work` — task launcher, artifacts, run history, screen index.
- `/app/knowledge` — question → documents → passage → answer, with *Why was this source used?*
- `/app/system` — node, models, demo/live mode, how to add a model.
- `/how-it-works`, `/capabilities`, `/security` — public explainer pages.
- `/login`, `/signup` — demonstration authentication.
- A 404 screen; unknown routes no longer silently redirect.

### Security architecture
- `securityMonitor` became `networkPolicy` (`egressGuard`) with an **explicit local allow path**. The v2 guard
  refused loopback too, which would have blocked the product's own FastAPI/vLLM architecture.
- XHR refusals are now counted at `send()` rather than `open()`, so an unsent request no longer inflates the
  counter.
- The patched `WebSocket` keeps its statics (`OPEN`, `CLOSED`, …).
- `probeLocal()` demonstrates that a legitimate loopback call is *permitted*, not blocked.
- Six new tests cover classification, refusal by mechanism, local allow, and audit/counter side effects.

### Honesty
- `SimNote` — a consistent, subtle *Demo simulation* label wherever a figure is deterministic rather than
  inferred.
- Demo/live mode at `/app/system`; live mode reports plainly that no orchestrator is listening.
- The v2 session ledger line asserted a user (`eng.sharma · LDAP`) with no authentication behind it. It now
  reads the real demonstration session.

### Everything else
- Audit ledger split into a **Summary** view (who, what, which files, which model, what was produced, what was
  held, did anything try to leave) and a **Technical log** with search, filter and spreadsheet export.
- Routing page leads with a five-row plain-language flow; the dispatch matrix moved behind a disclosure.
- Documents page gained an explicit **Human review required** callout.
- Sandbox gained an animated 2/7 → 7/7 test counter tied to the actual patch step.
- Night Ops rebuilt: running now, overnight queue, waiting on a human, boundary watch, activity sparkline.
- Archive keeps its paper feel inside the viewer card only; the page around it is normal product chrome.
- `ErrorBoundary`, `Empty`, `Skeleton`, `Modal`, `Toast`, `Disclosure`, `Meter`, `CountUp` primitives added.
- Accessibility: skip link, landmarks, real buttons instead of clickable divs, `aria-pressed`, `aria-expanded`,
  `role="progressbar"`, labelled `<pre>` blocks, 40px minimum targets, `prefers-reduced-motion` honoured
  throughout.
- Responsive rework at 1440 / 1280 / 1024 / 768 / 480 / 390 / 360; charts scroll inside their own container
  rather than pushing the page sideways.
- Test suite grew from 21 checks to 21 routes plus 33 behaviour checks plus the air-gap check.

### Kept deliberately unchanged
`src/lib/ooxml.ts`, `src/data/corpus.ts`, `src/data/telemetry.ts`, the seeded PRNG, the 0.85 OCR threshold,
the two attention steps, and the honest browser-vs-host framing of the sovereignty claim.

## 2.0.0
Previous build. See `docs/BASELINE.md` for its measured baseline and `docs/AUDIT_REPORT.md` for the audit that
produced this release.
