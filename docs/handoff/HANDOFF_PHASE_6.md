# HANDOFF — Phase 6: Routing, audit, Night Ops, Archive, System

**PHASE** 6 — Routing, audit, Night Ops, Archive, System
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- `/app/routing` — leads with a five-row plain-language flow; the dispatch matrix and the per-model bars moved
  behind a disclosure. A donut shows the 24-hour split.
- `/app/audit` — split into a **Summary** view (who, what, which files, which model, what was produced, what
  was held, did anything try to leave) and a **Technical log** with search, class filter and export.
- `/app/night` — rebuilt with product chrome: running now, overnight queue, waiting on a human, boundary
  watch, activity sparkline. Purple appears on one band edge and one dot.
- `/app/archive` — paper styling confined to the viewer card; the page around it is normal chrome, and the
  findings list cross-navigates between pages.
- `/app/system` (new) — run mode, VRAM, models, throughput, knowledge base, and how to add a model.

### Next phase
Independent audit and polish.

## Context for the next session

**Project** KAVACH — Sovereign On-Premise Agentic AI Workbench.
SIH 2026 · PS26117 · Mangalore Refinery and Petrochemicals Limited · Theme: Smart Automation · Team TokenGods.
Repo `https://github.com/Arav1904/sih_ps26117` · deploy `https://sih-ps26117.vercel.app/`.

**Stack** Vite + React 18 + TypeScript. Runtime dependencies: `react`, `react-dom`, `react-router-dom`, and
three `@fontsource` packages. No chart library, no UI framework, no CSS framework.

**Commands**
```bash
npm ci
npm run dev        # http://localhost:5173
npm run typecheck
npm run build
npm test           # types + 21 routes + 33 behaviour checks + OOXML + air-gap
```

**Hard constraints — do not break these**
1. `HashRouter` + `base: './'`. `dist/index.html` must open from `file://` on an air-gapped machine.
2. The egress guard installs in `main.tsx` *before* React mounts.
3. `src/lib/ooxml.ts` is not to be modified.
4. `src/data/telemetry.ts` is seeded (`mulberry32(26117)`); every figure in the product traces to it.
5. Adding a task type must stay a single entry in `src/data/scenarios.ts`.
6. Black + off-white + burgundy is the identity. Purple and warm may colour a dot, a hairline, one chart
   series or one glow — never a background.
7. No external network dependency of any kind. `tests/offline-check.mjs` enforces it.

**Demo accounts** `engineer@ | auditor@ | admin@kavach.local`, all `Kavach@2026`.
`demo@kavach.local` is an alias for the engineer account.

*This handoff is self-contained. A session that reads only this file and `docs/handoff/FINAL_HANDOFF.md` can
continue without rereading the conversation.*
