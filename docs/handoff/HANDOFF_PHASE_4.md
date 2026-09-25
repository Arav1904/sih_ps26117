# HANDOFF — Phase 4: Agent experience and core workflows

**PHASE** 4 — Agent experience and core workflows
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- `src/components/AgentTimeline.tsx` — steps grouped under the seven stages, active glow, check marks, tool
  icons, a progress fill, and per-step *Why this step?* with raw tool output behind it.
- Every `AgentStep` gained `stage` and `why`; every title was rewritten into plain language.
- `/app/run` rebuilt: request and plan as a two-turn exchange, spine, timeline, at-a-glance, input files,
  deliverables with working downloads, the four verification checks, and the findings grid.
- `/app/documents` — explicit **Human review required** callout, per-region selection, confidence chart.
- `/app/knowledge` (new) — question → documents → passage → answer, with *Why was this source used?*
- `/app/sandbox` — animated 2/7 → 7/7 counter tied to the actual patch step, not a timer.

### Design decision
Raw logs never appear on a primary surface. Level 1 is a sentence, level 2 is a picture, level 3 is a
`<Disclosure summary="Technical details">`.

### Next phase
Sovereignty and the security architecture.

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
