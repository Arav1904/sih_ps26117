# KAVACH — Phase 0 Audit Report

**Project** KAVACH — Sovereign On-Premise Agentic AI Workbench
**Problem statement** SIH 2026 · PS26117 · Mangalore Refinery and Petrochemicals Limited (MRPL) · Theme: Smart Automation
**Repository** https://github.com/Arav1904/sih_ps26117
**Deployment** https://sih-ps26117.vercel.app/
**Audited build** `kavach@2.0.0` (ZIP supplied 2026-09-16)
**Auditor** takeover session, Phase 0 — no redesign performed at this point.

---

## 1. What the baseline actually is

A Vite + React 18 + TypeScript single-page application. 3,065 lines of source across 40 files.
Zero runtime dependencies beyond `react`, `react-dom`, `react-router-dom`. No chart library, no UI
framework, no CSS framework. Everything — OOXML writing, charts, the egress interceptor — is
hand-written.

That restraint is the single best thing about the baseline and it is preserved.

### Module inventory

| Layer | Files | Verdict |
|---|---|---|
| Entry | `main.tsx`, `App.tsx`, `index.html` | Sound. `HashRouter` is the right call for an air-gapped `file://` demo. |
| Types | `types.ts` | Clean contracts. Extendable. Keep. |
| State | `state/store.ts` | A small `useSyncExternalStore` store. Drives the deterministic timeline. Keep, extend. |
| Services | `agent`, `artifact`, `audit`, `knowledge`, `modelRouter`, `ocr`, `securityMonitor` | Good separation. `securityMonitor` needs restructuring (see §4). |
| Lib | `ooxml.ts`, `classify.ts`, `format.ts` | `ooxml.ts` is genuinely impressive — real `.docx`/`.xlsx` with a store-only ZIP writer, no dependency, deterministic bytes. Keep untouched. |
| Data | `corpus.ts`, `scenarios.ts`, `telemetry.ts` | Fictional demo corpus, seeded PRNG telemetry so numbers are identical on every machine. Excellent. Keep. |
| Components | `ui.tsx`, `ConsoleShell.tsx`, `charts.tsx` | Thin. `charts.tsx` has 8 hand-drawn SVG charts, all reading the same arrays the prose reads. Keep and extend. |
| Pages | 10 | Content is strong; presentation is the problem. |
| Tests | `scripts/test.mjs` + 3 test files | Typecheck → esbuild bundle → jsdom route smoke → behaviour → OOXML write. Good harness. Extend. |

### Baseline verification (run during this audit)

```
npm install        130 packages, 3s
npm run build      ✓ 59 modules, 247.41 kB js (80.56 kB gzip), 12.71 kB css, 1.93s
npm test           ✓ 10/10 routes render clean, 11/11 behaviour checks, OOXML written
```

No TypeScript errors, no build errors, no console errors in jsdom. **The baseline is green.**

---

## 2. Findings — product and UX

### P1. The product does not explain itself in 20–30 seconds
The landing page opens with a paragraph of prose. There is no visual of the pipeline, no
"what happens to my file" picture, no CTA hierarchy. A judge has to *read* to find out what
KAVACH is. Severity: **critical** — this is the whole judging surface.

### P2. Four surfaces read as four products
Landing is a warm orange→plum gradient. Console is black/paper/burgundy. Archive is cream paper.
Night Ops is a deep-purple full-bleed. Moving between them feels like changing website, not
changing screen. Severity: **critical**.

### P3. There is no authentication and no sense of "entering" the product
`/console` is reachable by URL. There is no session, no user, no role, no logout. The nav claims
`Session: eng.sharma, inspection engineer` which is hard-coded text with nothing behind it.
Severity: **high** (also a small honesty problem).

### P4. The agent run is a table, not a performance
`AgentRun.tsx` has all the right data — 12 steps, tool names, per-step detail, attention flags,
a Gantt. But it renders as rows that change a status word. There is no plan announcement, no
active-step glow, no check marks, no stage grouping, no sense of watching a system work.
This is the centrepiece of an *agentic* AI problem statement and it currently under-sells itself
more than any other screen. Severity: **critical**.

### P5. Copy is written for the author, not the visitor
"dispatch matrix", "retrievable clause", "sovereignty gate", "task classification", "candidate
models", "fallback model". Correct, but a first-year student does not parse it. There is no
progressive disclosure: level-3 technical language is on the level-1 surface. Severity: **high**.

### P6. Information density is uniformly high
Every page is panel-after-panel at the same visual weight. `13px` body text, `18px 20px` panel
padding, `26px` grid gaps, no section rhythm, no hero moments inside pages. Nothing tells the eye
where to start. Severity: **high**.

### P7. No dashboard / no command centre
`/console` (Overview) is a metrics page. There is no "what would you like to work on?" moment,
no recent work, no active tasks, no task launcher. The `AskBar` exists but is a 1-line footer
element on every page that only echoes a classification string — it cannot actually start work.
Severity: **high**.

### P8. Night Ops is nearly empty
`/night` renders 227 characters of text in the smoke test — the least of any route. It shows an
idle row, held pages and up to 3 refusals. It is a mood, not a screen. Severity: **medium**.

### P9. Archive has no product chrome
`/archive` has a back link and nothing else — no nav, no way to reach any other screen. A judge
who lands there is stranded. Severity: **medium**.

### P10. No empty / loading / error states worth the name
`EmptyState` does not exist; empties are a `Row` with a sentence. There is no error boundary, no
404 page (unknown routes silently `Navigate` to `/`), no skeletons. Severity: **medium**.

---

## 3. Findings — engineering

### E1. Google Fonts is a hard external dependency
`index.html` loads Archivo, JetBrains Mono and Courier Prime from `fonts.googleapis.com`.
For a problem statement whose *entire premise* is air-gapped operation, the demo page makes three
external requests before React mounts. The Sovereignty page honestly admits this, which is to its
credit, but it is still the sharpest self-inflicted wound in the build. Severity: **critical**.

### E2. `securityMonitor` blocks *all* traffic, including loopback
`gate.refuse()` is called unconditionally for every `fetch`, `XHR`, `WebSocket` and `sendBeacon`.
There is no allow path. The moment a real local FastAPI/vLLM backend is added at
`127.0.0.1:8000`, the guard blocks the product's own architecture. The PS explicitly anticipates a
local model server, so this is a design dead-end, not just a nit. Severity: **high**.

### E3. `securityMonitor` XHR patch is subtly wrong
`XMLHttpRequest.prototype.open` records a refusal and then **still calls the original `open`**.
`send` short-circuits, so no request goes out — but the refusal is recorded at `open()` time,
which means an `open()` that is never `send()`-ed still increments the blocked counter. Severity:
**low** (counter honesty).

### E4. `WebSocket` patch loses statics
`Patched.prototype = OriginalWS.prototype` copies the prototype but not `WebSocket.OPEN`,
`CLOSED`, etc. Any library reading those constants gets `undefined`. Severity: **low**.

### E5. No route-level code splitting
All 10 pages are imported eagerly in `App.tsx`. 247 kB of JS for a landing page that needs a
fraction of it. Severity: **low** (small app) but worth fixing as pages grow.

### E6. Body background is set imperatively from a regex table
`App.tsx` mutates `document.body.style.background` on every navigation via a `RegExp[]` lookup.
Works, but it is a symptom of P2 — it only exists because the surfaces disagree. Severity:
**low**; disappears with the unified palette.

### E7. Unhandled failure modes
No `ErrorBoundary`. `downloadArtifact` has no try/catch around `URL.createObjectURL`. `classify()`
uses `!` assertions on registry lookups that would throw if a scenario named a model id that was
removed from `MODELS`. Severity: **medium**.

### E8. `store.boot()` records a session line for a user that does not exist
`'eng.sharma · LDAP · role: inspection engineer'` is asserted in the audit ledger with no
authentication behind it. Once demo auth exists this must read the real session. Severity:
**medium** (honesty).

### E9. Accessibility gaps
- Clickable `<div>`s used as buttons in `AgentRun` (step rows), `DocumentTask` (region rows) and
  `PageScan` SVG groups — not focusable, not keyboard-operable, no `role`.
- `<pre className="code">` blocks have no label and scroll horizontally with no keyboard affordance.
- Filter buttons have no `aria-pressed`.
- No skip link. No landmark `<main>` on Archive/Night Ops.
- Focus ring exists (`:focus-visible` burgundy) — good, keep.
Severity: **medium**.

### E10. Responsiveness is one breakpoint
A single `@media (max-width: 900px)` block. At 480px and 390px the Gantt/Matrix SVGs (fixed
`viewBox` widths of 560 and `left=188..208` label gutters) squash their labels to illegibility;
`.c-grid.two` at `minmax(330px,1fr)` overflows below ~370px. Severity: **medium**.

### E11. No demo-mode labelling in the UI
Panels describe OCR confidences, dispatch counts and sandbox runs in the present indicative. The
prose is careful, but nothing on screen tells a judge *this figure is a deterministic simulation,
not a live 70B inference*. The README says so; the UI does not. Severity: **high** (credibility).

### E12. Test coverage gaps
No test for: the egress guard allowing a legitimate local request; route protection; artifact
download path; reduced-motion; responsive overflow. Severity: **medium**.

---

## 4. Architecture constraints discovered

1. **`HashRouter` must stay.** `vite.config.ts` sets `base: './'` so `dist/` opens from `file://`.
   A `BrowserRouter` would break that and would need Vercel rewrites. Keep hash routing.
2. **The egress guard must be installed before React mounts** (`main.tsx` line order). Any
   refactor must preserve that ordering or the guarantee is weaker than claimed.
3. **`ooxml.ts` emits byte-identical output** (fixed ZIP timestamp). Do not "improve" it.
4. **`telemetry.ts` is seeded (`mulberry32(26117)`)** so every machine shows identical figures.
   Any new chart must read `DISPATCHES` rather than invent numbers, or the demo stops being
   reproducible and the prose stops matching the charts.
5. **The scenario array is the extension point.** Adding a task type is one entry in
   `SCENARIOS` — that claim is true today and must stay true.

---

## 5. What must not be touched

- `src/lib/ooxml.ts` — the OOXML writer.
- `src/data/corpus.ts`, `src/data/telemetry.ts` — the fictional corpus and the seeded log.
  (Additive fields only.)
- The honesty framing on the Sovereignty page (browser-level vs OS-level enforcement).
- Hand-drawn SVG charts as the charting strategy. No chart library is to be added.

---

## 6. Priority ranking for the redesign

| # | Item | Phase |
|---|---|---|
| 1 | One design system, one product identity | 1 |
| 2 | Remove the Google Fonts dependency | 1 |
| 3 | Landing that explains KAVACH in 20 seconds | 2 |
| 4 | Demo authentication + session + route protection | 2 |
| 5 | Dashboard + Ask KAVACH command centre | 3 |
| 6 | Agent run as a watchable performance | 4 |
| 7 | Sovereignty as a network picture, not a table | 5 |
| 8 | Routing / Audit / Night Ops / Archive integration | 6 |
| 9 | Simplify every primary string; disclosure for level 3 | 1–7 continuous |
| 10 | `egressGuard` with a local allow path + tests | 5 |
| 11 | Accessibility + responsive sweep | 7 |
| 12 | Docs, demo script, final verification | 8 |

---

## 7. Baseline screenshots

The audit environment is headless with no browser binary available, so pixel screenshots could not
be captured. `docs/BASELINE.md` records the equivalent: per-route DOM size, SVG count, build
output, bundle size and test results, which is what the later phases are compared against.
