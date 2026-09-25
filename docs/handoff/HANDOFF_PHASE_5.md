# HANDOFF — Phase 5: Sovereignty and security UX

**PHASE** 5 — Sovereignty and security UX
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- `src/services/networkPolicy.ts` replaces `securityMonitor` with an explicit classifier and a **local allow
  path** (`localhost`, `127.0.0.1`, `::1`, unix sockets, same origin). `securityMonitor.ts` remains as a
  re-export shim so v2 import paths resolve.
- XHR refusals now counted at `send()`, not `open()`. `WebSocket` statics restored. `sendBeacon` covered.
- `probeLocal()` demonstrates that a legitimate loopback call is permitted and does not move the counter.
- `/app/sovereignty` rebuilt around the boundary diagram, with both buttons and the honesty panel.
- `tests/offline-check.mjs` — fails the suite on any external reference in `dist/`.
- Six new policy tests plus three egress-mechanism tests.

### Architectural decision
The guard is a *policy*, not a blanket block. A guard that refused loopback would have made the documented
production architecture impossible to build.

### Next phase
Routing, audit, Night Ops, Archive and System.

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
