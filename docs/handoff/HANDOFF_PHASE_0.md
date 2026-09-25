# HANDOFF — Phase 0: Audit and baseline

**PHASE** 0 — Audit and baseline
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- Full read of the v2 source (3,065 lines, 40 files); install, build and test run clean at baseline.
- `docs/AUDIT_REPORT.md` — 12 product/UX findings and 12 engineering findings, each with a severity.
- `docs/BASELINE.md` — per-route DOM size, SVG count, bundle size, external dependencies.
- `docs/IMPLEMENTATION_PLAN.md` — eight phases and seven governing decisions.

### Headline findings
1. Google Fonts is a hard external dependency in an air-gap product. **Critical.**
2. `securityMonitor` blocks loopback, which would block the product's own FastAPI/vLLM backend. **High.**
3. The agent run has the right data but renders as a table, not something you watch. **Critical.**
4. Four surfaces read as four separate products. **Critical.**
5. `/night` renders 227 characters — the thinnest route in the build. **Medium.**

### No UI change in this phase
Deliberately. The audit had to be written before anything moved.

### Next phase
Design system and app shell.

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
