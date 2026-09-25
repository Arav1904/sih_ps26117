# KAVACH — Final handoff

**PHASE** 8 — Release candidate
**STATUS** COMPLETE
**VERSION** 3.0.0
**DATE** 2026-09-16
**BUILD** green

---

## 1 · What this is

KAVACH — Sovereign On-Premise Agentic AI Workbench.
Smart India Hackathon 2026 · **PS26117** · Mangalore Refinery and Petrochemicals Limited · Smart Automation.
Team TokenGods. Repo `https://github.com/Arav1904/sih_ps26117` · deploy `https://sih-ps26117.vercel.app/`.

A private AI workbench for confidential industrial work. A file goes in; the system works out what is being
asked, picks the right local model, does the job step by step in front of you, verifies its own answer, and
hands back a real file — keeping every byte and a full audit trail on one machine inside the building.

The product is seven words: **INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT.**

---

## 2 · Status

| Check | Result |
|---|---|
| `npm run typecheck` | clean |
| `npm run build` | 353 kB JS (110 kB gzip), 43 kB CSS (8.5 kB gzip), 12 bundled font files |
| Route smoke | 21/21 — 7 public, 12 signed-in, 2 guarded |
| Behaviour | 33/33 — auth, network policy, agent run, egress both directions, logout |
| OOXML | real `.docx` and `.xlsx` written to `tests/.out` |
| Air-gap | `dist/` fetches nothing from the internet |
| Console errors | 0 |
| Dead routes / dead buttons / placeholders | 0 |

---

## 3 · Commands

```bash
npm ci
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
npm test
npm run preview
```

Node 18+ (developed on 22). Nothing else required.

### Deploy
Push to `main`. Vercel needs no configuration — `HashRouter` plus `base: './'` means no rewrite rules and no
framework preset. For an air-gapped demo, copy `dist/` to a USB stick; `index.html` opens from `file://`.

---

## 4 · Demo accounts

| Role | Email | Password |
|---|---|---|
| Engineer | `engineer@kavach.local` | `Kavach@2026` |
| Auditor | `auditor@kavach.local` | `Kavach@2026` |
| Administrator | `admin@kavach.local` | `Kavach@2026` |

`demo@kavach.local` is an alias for the engineer account. Authentication is frontend-only and labelled as such
on screen and in the docs.

---

## 5 · Where everything lives

```
src/
  main.tsx              guard → auth → store → mount (order is the guarantee)
  App.tsx               21 routes, RequireAuth, ErrorBoundary, GuidedDemo
  styles/               tokens · base · layout · components · pages
  components/           Shell · ui · icons · diagrams · charts
                        AgentTimeline · AskKavach · GuidedDemo
                        RequireAuth · ErrorBoundary · PageHead
  config/nav.tsx        navigation + the PS line each screen answers
  pages/                19 screens
  state/                store + useAuth / useEgress / useAudit
  services/             networkPolicy · auth · agent · artifact · audit
                        knowledge · modelRouter · ocr · securityMonitor (shim)
  lib/                  ooxml · classify · format
  data/                 corpus · scenarios · telemetry · stages
tests/                  smoke · behaviour · ooxml-check · offline-check
scripts/test.mjs        one command that runs all of it
docs/                   architecture · demo · design-system · security
                        AUDIT_REPORT · BASELINE · IMPLEMENTATION_PLAN · handoff/
```

Root documents: `README.md`, `FINAL_ARCHITECTURE.md`, `FINAL_DEMO_SCRIPT.md`, `FINAL_AUDIT_REPORT.md`,
`KNOWN_LIMITATIONS.md`, `CHANGELOG.md`.

---

## 6 · Hard constraints

1. **`HashRouter` + `base: './'`.** `dist/index.html` must open from `file://`. Do not switch to
   `BrowserRouter` and do not add code splitting — a second chunk needs a server to fetch it from.
2. **The egress guard installs before React mounts** (`main.tsx` line order). That ordering *is* the claim.
3. **`src/lib/ooxml.ts` is not to be modified.** Dependency-free, byte-identical, validated against
   python-docx, openpyxl and LibreOffice.
4. **`src/data/telemetry.ts` is seeded** (`mulberry32(26117)`). Every routing figure traces to it. Reseeding
   changes every number in the product for no gain.
5. **Adding a task type stays one entry** in `src/data/scenarios.ts`. That extensibility is part of the
   product claim, so it has to stay true.
6. **Black + off-white + burgundy is the identity.** Purple may colour a dot, a hairline or one band edge;
   warm may colour one hero glow. Neither owns a background anywhere.
7. **No external network dependency, ever.** `tests/offline-check.mjs` fails the build if one appears.
8. **Never imply live inference.** Anything deterministic carries a `<SimNote>`.

---

## 7 · Design decisions worth knowing

- **One shell for the whole product.** Public and authenticated routes use the same black bar and footer; only
  the nav items change. This is what stopped the four-surfaces problem from v2.
- **Three-level information model on every screen.** A sentence, then a picture, then a
  `<Disclosure summary="Technical details">`. No screen forces level 3 first.
- **Hybrid chat, not a transcript.** Ask KAVACH classifies, announces a plan and starts the real run. There is
  no scrollback to manage.
- **The workflow spine is a component**, used on four screens and used to group the timeline. Learn seven words
  once; every screen reads the same way.
- **Charts are hand-drawn SVG and read the same arrays the prose reads.** They cannot disagree with the
  sentence beside them.
- **Honesty is a feature.** The browser-vs-host distinction on the Security screen, the *Demo simulation*
  labels, the live-mode failure message and the fictional-data footer are all deliberate. Do not "tidy" them
  away — they are the most credible thing in the product.

---

## 8 · Architectural decisions

- **No backend was added.** A server hosting fake authentication would describe an architecture that does not
  exist. `services/auth.ts` is the single seam a real LDAP/OIDC integration replaces.
- **The egress guard is a policy, not a block.** Loopback is permitted so that the documented FastAPI + vLLM +
  Qdrant + sandbox architecture remains buildable. This was the largest correction to v2.
- **`store.start()` is the only place the simulation lives.** Replace its timer with a stream of `AgentStep`
  events and nothing above `state/` moves. `src/types.ts` is the contract a backend must emit.
- **No dependency added except three OFL font packages.** No chart library, no UI kit, no CSS framework.

---

## 9 · Demo state

Ready. Press **Run the guided demo** on the landing page or the dashboard — eight stops, about four minutes.
Full narration in `FINAL_DEMO_SCRIPT.md`, including the three questions judges most often ask and the honest
answers to them.

Golden path: landing → sign in → dashboard → agent run → documents → sandbox → routing → data boundary → audit.

---

## 10 · Known issues

None blocking. Everything the prototype does not do is listed in `KNOWN_LIMITATIONS.md` — the headline items
are that model inference is simulated (and labelled), the guard is browser-level not host-level (and says so),
authentication is a demonstration (and says so), and there is no backend yet (and the live-mode screen says
so).

---

## 11 · What a next session should do

1. **Build the FastAPI orchestrator.** The seam is drawn, the types are the contract, and the network policy
   already permits loopback. Largest available credibility gain.
2. **Add an Indic worked example.** The router rule and the model registry entry exist; the corpus has no
   Devanagari or Kannada document, so the capability is declared rather than demonstrated.
3. **Persist the audit ledger** beyond the session, so a judge who reloads does not lose it.
4. **Run a real screen-reader pass.** The semantics are right by inspection; they have not been heard.
5. **Add a headless-browser responsive test** to replace hand-verification at 360–1440px.

Do not start by refactoring. The build is clean, the tests are green, and the visual system is settled.

---

## 12 · Exact next steps

```bash
unzip KAVACH_FINAL.zip && cd KAVACH
npm ci
npm test          # confirm green before changing anything
npm run dev
```

Then read, in this order: `README.md` → `docs/handoff/FINAL_HANDOFF.md` (this file) →
`FINAL_ARCHITECTURE.md` → `docs/design-system.md`. That is enough to work on any part of it.
