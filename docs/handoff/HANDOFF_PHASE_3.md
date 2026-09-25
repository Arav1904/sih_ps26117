# HANDOFF — Phase 3: Dashboard and command centre

**PHASE** 3 — Dashboard and command centre
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- `/app` — greeting, "What would you like to work on?", the Ask KAVACH box, four quick-task cards, the
  local-only status strip, active work with a progress meter, recent work, waiting-on-you, node activity.
- `src/components/AskKavach.tsx` — classifies free text, announces a plan, and **starts the matching run**.
  It is not an echo box: the Run button navigates to the right screen with the run already going.
- `/app/work` — task launcher, artifacts, run history, and an index of every screen.
- `src/data/stages.ts` + `WorkflowSpine` — INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT.

### Design decision
Hybrid chat-plus-workspace, not a transcript. One request in, a task card with a plan out. The brief asked for
Claude-style ease with enterprise instrumentation; an endless scrollback would have been neither.

### Next phase
The agent experience and the core workflows.

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
