# HANDOFF — Phase 7: Independent audit and polish

**PHASE** 7 — Independent audit and polish
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
Sixteen problems found in a second pass and fixed in the same phase. Full write-up in
`FINAL_AUDIT_REPORT.md`. The ones worth knowing about:

- The mobile sign-in screen hid the demo credentials with no alternative. Added a modal.
- `agent.ts` and `modelRouter.ts` had become dead code; both wired into the screens that should use them.
- `SUGGESTIONS` was exported and never rendered; now the chips under the command bar.
- A skeleton loader was defined and unused; deleted rather than shipped (there is no real latency to mask).
- Wide charts pushed the page sideways below 420px; all now scroll inside `.chart-scroll`.
- Clickable `<div>`s replaced with real buttons carrying `aria-pressed` / `aria-expanded`.
- Reduced motion now honoured in JavaScript as well as CSS.
- Download and export paths gained failure handling and toast feedback.
- `<link rel="preconnect">` to Google survived the font removal; both tags deleted.

### Next phase
Release candidate.

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
