# HANDOFF — Phase 1: Design system and app shell

**PHASE** 1 — Design system and app shell
**STATUS** COMPLETE
**BUILD** green · `npm run typecheck`, `npm run build`, `npm test` all pass
**DATE** 2026-09-16

### Completed
- `src/styles/tokens.css` — colour, type, spacing, radius, elevation, motion, layer tokens.
- `src/styles/{base,layout,components,pages}.css` replacing the single v2 `styles.css`.
- **Google Fonts removed.** Archivo, JetBrains Mono and Courier Prime bundled via `@fontsource` (SIL OFL).
- `src/components/Shell.tsx` — one black top bar, user menu, mobile drawer, footer, for every route.
- `src/components/ui.tsx` — Panel, Button, Stat, Row, Badge, Dot, Conf, Disclosure, Empty, Meter, Callout,
  SimNote, Tabs, Modal, ToastTray, CountUp.
- `src/components/icons.tsx` — 27 hand-drawn strokes plus a tool→icon map.
- `src/config/nav.tsx` — navigation, with the PS line each screen answers.

### Design decisions
- One shell for public and authenticated routes; only the nav items change.
- Purple demoted to a Night Ops marker, warm to a single hero glow. Neither owns a background.
- Body text floor 13px; 11px reserved for metadata. Monospace for machine values only.

### Next phase
Landing page and demonstration authentication.

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
