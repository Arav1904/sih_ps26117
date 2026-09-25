# KAVACH — Sovereign On-Premise Agentic AI Workbench

**Smart India Hackathon 2026 · PS26117 · Mangalore Refinery and Petrochemicals Limited · Theme: Smart Automation**
Team TokenGods · v3.0.0

> Private AI for sensitive industrial work.
> **Think. Act. Verify. Deliver. Without sending your data outside.**

---

## What KAVACH is

Refinery teams do a lot of careful paperwork — inspection reports, approval notes, cost estimates, small
pieces of code. None of it can be pasted into a public AI tool, because what is inside it is not allowed to
leave the site.

KAVACH is that assistant, running on one GPU server inside the building, with no route out to the internet.
You hand it a file. It works out what is being asked, picks the right local model for that kind of work, does
the job step by step in front of you, checks its own answer, and hands you back a real file — while keeping a
visible audit trail of everything it did.

The whole product is seven words:

```
INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT
```

Learn those once and every screen makes sense.

---

## Run it

```bash
npm ci          # or npm install
npm run dev     # http://localhost:5173
```

```bash
npm run typecheck   # tsc -b
npm run build       # production build into dist/
npm test            # types + routes + behaviour + OOXML + air-gap check
npm run preview     # serve the production build
```

Node 18+ (developed on Node 22). No other tooling required.

### Deploying

The app uses `HashRouter` and `base: './'`, so:

- **Vercel** — push to `main`. No `vercel.json`, no rewrite rules, no framework config needed.
- **Air-gapped** — copy `dist/` to a USB stick. `dist/index.html` opens directly from `file://` with no server
  and no network. This is verified in CI by `tests/offline-check.mjs`.

---

## Demo accounts

Sign-in is a **demonstration**. It runs entirely in the browser and keeps its session in `localStorage`.
There is no identity provider, no token and no password hashing — see *Known limitations*.

| Role | Email | Password |
|---|---|---|
| Engineer | `engineer@kavach.local` | `Kavach@2026` |
| Auditor | `auditor@kavach.local` | `Kavach@2026` |
| Administrator | `admin@kavach.local` | `Kavach@2026` |

`demo@kavach.local` / `Kavach@2026` is an alias for the engineer account. The sign-in screen lists all three
and fills the form in for you. You can also create a local account from `/signup`; it is written to this
browser only.

---

## The four-minute demo

Press **Run the guided demo** on the landing page or the dashboard. It walks eight stops:

1. **Home** — ask for anything, or pick a job.
2. **Agent run** — watch the seven stages fill in, step by step.
3. **Documents** — page 8 scored too low to trust, so it is *held* rather than guessed at.
4. **Knowledge** — every finding is bound to a real clause in your own procedures.
5. **Sandbox** — 2 of 7 tests pass, the fix lands, all 7 pass.
6. **Model routing** — five kinds of input, five different local models.
7. **Data boundary** — press the button and watch a real call to a public AI endpoint be refused.
8. **Audit** — everything you just watched, in order, exportable as a spreadsheet.

The full narration is in [`FINAL_DEMO_SCRIPT.md`](FINAL_DEMO_SCRIPT.md).

---

## Routes

| Route | Access | Screen |
|---|---|---|
| `/` | public | Landing |
| `/how-it-works` | public | The seven stages, explained |
| `/capabilities` | public | What it can do, with proof links |
| `/security` | public | The data boundary, explained honestly |
| `/login`, `/signup` | public | Demonstration authentication |
| `/app` | session | Home — greeting, Ask KAVACH, quick tasks, status |
| `/app/work` | session | Task launcher, artifacts, run history, screen index |
| `/app/run` | session | Agent run — the centrepiece |
| `/app/documents` | session | Scans, drawings, confidence, human-review flag |
| `/app/knowledge` | session | Question → documents → passage → answer |
| `/app/sandbox` | session | Code repaired and proved in a sandbox |
| `/app/routing` | session | Which model takes which job, and why |
| `/app/sovereignty` | session | The live network monitor |
| `/app/audit` | session | Summary view and technical log |
| `/app/system` | session | Node, models, demo/live mode |
| `/app/night` | session | Night Ops |
| `/app/archive` | session | The source document, page by page |

`/console/*`, `/archive` and `/night` from the previous build redirect into `/app/*`. Anything else gets a 404
screen with a way back.

---

## Demo mode and live local mode

**Demo mode (default)** — the agent timeline, OCR confidences and routing statistics are deterministic
demonstration logic. They are identical on every machine, which is what makes the demonstration reproducible.
Everything simulated is labelled *Demo simulation* in the interface.

**Live local mode** — switch it on at `/app/system`. KAVACH calls `http://127.0.0.1:8000/healthz`. This
prototype ships without that backend, so the probe fails and the screen says so plainly rather than pretending.
That failed call is itself informative: it was **permitted** by the network policy, because loopback is inside
the boundary.

**What is real in both modes:** the network policy, the audit ledger, and the generated `.docx` / `.xlsx` /
`.py` files — which are produced in the browser with no library and no network, and open in Word and Excel.

---

## Sovereignty model

The egress guard (`src/services/networkPolicy.ts`) replaces `fetch`, `XMLHttpRequest`, `WebSocket` and
`navigator.sendBeacon` **before React mounts**. Every call is classified first:

```
localhost, 127.0.0.1, 0.0.0.0, ::1, kavach.local   → local, passed through, counted
file:, blob:, data:, unix:, /run/…, /var/…          → local, passed through, counted
same origin as this document                        → local, passed through, counted
everything else                                     → refused, logged, counted
```

The local allow path matters: a guard that blocked loopback would block KAVACH's own production architecture.

**What this is not:** a host firewall. A browser cannot police its operating system. In deployment the same
policy is enforced outside the browser — egress rules on the node, and a code sandbox with no network
namespace attached. The Security screen says exactly this, in those words.

---

## Offline operation

The build fetches nothing. Typefaces (Archivo, JetBrains Mono, Courier Prime — all SIL OFL) are bundled from
`node_modules` by Vite instead of loaded from a font CDN, which is what the previous build did. No CDN, no
analytics, no external images, no cloud AI, no remote font request.

`tests/offline-check.mjs` walks `dist/` and fails the suite on any absolute `src`/`href`, any external
`url()`, or any URL literal not on a short documented list. A new external dependency cannot land unnoticed.

---

## Extending it

**Add a model** — one row in `MODELS` (`src/data/corpus.ts`) plus a candidate entry in `TASK_CLASSES`
(`src/data/telemetry.ts`). No component changes. The exact snippet is on `/app/system` under *Technical
details*.

**Add a task type** — one entry in `SCENARIOS` (`src/data/scenarios.ts`) with its inputs, routing decisions and
steps. Each step declares its `stage`, a plain-language `why`, and the raw `detail`. No component changes.

**Add a backend** — the seam is already drawn. `store.start()` walks a scenario's steps on a timer; replace
that with a stream from a FastAPI orchestrator emitting the same `AgentStep` shape and nothing above the
service layer moves. See [`FINAL_ARCHITECTURE.md`](FINAL_ARCHITECTURE.md).

---

## Documentation

| File | What it covers |
|---|---|
| [`FINAL_ARCHITECTURE.md`](FINAL_ARCHITECTURE.md) | Layers, data flow, the backend seam |
| [`FINAL_DEMO_SCRIPT.md`](FINAL_DEMO_SCRIPT.md) | Four-minute narration for judges |
| [`FINAL_AUDIT_REPORT.md`](FINAL_AUDIT_REPORT.md) | The independent second-pass audit and what it fixed |
| [`KNOWN_LIMITATIONS.md`](KNOWN_LIMITATIONS.md) | Everything this prototype does not do |
| [`CHANGELOG.md`](CHANGELOG.md) | v2 → v3 |
| `docs/design-system.md` | Tokens, components, the colour rule |
| `docs/security.md` | The egress guard in detail |
| `docs/architecture.md` | Module-by-module reference |
| `docs/demo.md` | Demo mode, demo data, labelling policy |
| `docs/AUDIT_REPORT.md` | The original Phase 0 audit of v2 |
| `docs/BASELINE.md` | v2 metrics, for comparison |
| `docs/handoff/` | Per-phase handoff documents |

---

## Demonstration data

**All demonstration data is fictional.** No MRPL document, drawing, equipment tag, rate or procedure is used
anywhere in this repository. Unit names, tag numbers, clause references and rates are invented for the
demonstration and labelled as such in the interface. It is a *representative industrial workflow*, not a real
one.
