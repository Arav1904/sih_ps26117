# KAVACH — Implementation Plan

Derived from `docs/AUDIT_REPORT.md`. Eight phases, each ending green (typecheck + build + tests).

## Governing decisions

1. **One design system.** Console black / paper / burgundy becomes the product identity on every
   route. Purple and warm are demoted to accent tokens with a hard rule: they may colour a dot, a
   glow, a single chart series or a border — never a page background.
2. **Fonts ship in the bundle.** `@fontsource/archivo`, `@fontsource/jetbrains-mono`,
   `@fontsource/courier-prime` (all SIL OFL) replace the Google Fonts `<link>`. Latin subsets
   only, selected weights only. The built `dist/` then requests nothing at all.
3. **`HashRouter` stays.** `base: './'` + hash routing is what lets `dist/index.html` open from a
   USB stick on an air-gapped machine. No Vercel rewrite file is needed either.
4. **Demo authentication is frontend-only and says so.** `localStorage`, three demo roles, a
   visible "Demonstration authentication" label on the login screen and in the docs. No backend is
   added for it — adding one would be a lie about the architecture, not an improvement to it.
5. **No new runtime dependency** beyond the three font packages. Charts stay hand-drawn SVG.
6. **The information model is three levels everywhere.** Level 1 plain sentence → level 2 picture →
   level 3 `<details>` "Technical details". No screen forces level 3 first.
7. **`INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT`** becomes a real component
   (`WorkflowSpine`) used on the landing page, the dashboard and the agent run, so the same seven
   words carry the whole product.

## Phases

### Phase 0 — Audit + baseline ✅
`docs/AUDIT_REPORT.md`, `docs/BASELINE.md`, this plan, `docs/handoff/HANDOFF_PHASE_0.md`.
No UI change.

### Phase 1 — Design system + app shell
- `src/styles/tokens.css` — colour, spacing, radius, type, shadow, motion, z-index tokens.
- `src/styles/base.css`, `components.css`, `pages.css` — replacing the single `styles.css`.
- Local fonts; delete the Google Fonts `<link>`.
- `Shell` (black top bar, product nav, status chip, user menu, mobile drawer) + `SiteFooter`.
- Primitives: `Button`, `Panel`, `Card`, `Stat`, `Row`, `Badge`, `StatusDot`, `Disclosure`,
  `EmptyState`, `Skeleton`, `Modal`, `Toast`, `SectionHeader`, `Meter`.
- Motion utilities honouring `prefers-reduced-motion`.

### Phase 2 — Landing + auth
- New landing: hero, workflow spine, sovereignty explainer, model routing visual, agent visual,
  deliverables, network isolation, use cases, final CTA, footer.
- `/how-it-works`, `/capabilities`, `/security` public pages.
- `services/auth.ts`, `AuthProvider`, `/login`, `/signup`, `RequireAuth`, logout, session
  persistence, role-aware nav.
- Legacy `/console/*`, `/archive`, `/night` redirect into `/app/*`.

### Phase 3 — Dashboard + command centre
- `/app` — greeting, "What would you like to work on?", large Ask KAVACH input, suggestion chips,
  task cards, recent work, active task, system status, sovereignty status strip.
- Ask KAVACH classifies and **starts real work** (routes to the matching run and launches it).

### Phase 4 — Agent experience + core workflows
- Agent run rebuilt: request → plan announcement → staged, animated timeline with glow, checks,
  tool icons, per-step "why this step?", confidence, deliverable hand-off, technical disclosure.
- Documents, Knowledge (new page), Sandbox with an animated 2/7 → 7/7 counter.

### Phase 5 — Sovereignty + security UX
- `services/networkPolicy.ts` (`egressGuard`) with an explicit local allowlist
  (`localhost`, `127.0.0.1`, `[::1]`, same-origin relative, unix sockets) and external refusal.
- Network boundary SVG, blocked-call monitor, local services, honest scope panel, offline notes.
- New tests: local allowed, external blocked, ws blocked, beacon blocked, audit + counter.

### Phase 6 — Routing, Audit, Night Ops, Archive
- Routing: simple five-row flow first, matrix behind disclosure.
- Audit: Summary view + Technical log view, search, filter, export.
- Night Ops: product chrome, purple as accent only, live activity strip.
- Archive: product chrome outside, paper only inside the viewer card.
- `/app/system` (models, node, demo/live mode).

### Phase 7 — Independent audit + polish
Second pass for problems not listed in the brief: dead ends, contradictions, contrast, mobile
overflow at 360–480px, keyboard traps, console noise, copy drift, number drift.

### Phase 8 — Release candidate
Final build, offline verification, demo script, README, architecture, known limitations,
changelog, `KAVACH_FINAL.zip`.

## Route map after Phase 2

| Route | Access | Screen |
|---|---|---|
| `/` | public | Landing |
| `/how-it-works` | public | How KAVACH works |
| `/capabilities` | public | Capabilities |
| `/security` | public | Security / sovereignty explainer |
| `/login`, `/signup` | public | Demo authentication |
| `/app` | auth | Home / command centre |
| `/app/work` | auth | Task launcher + run history |
| `/app/run` | auth | Agent run (inspection) |
| `/app/sandbox` | auth | Code repair, sandboxed |
| `/app/documents` | auth | Documents and drawings |
| `/app/knowledge` | auth | Knowledge base |
| `/app/routing` | auth | Model routing |
| `/app/sovereignty` | auth | Your data stays here |
| `/app/audit` | auth | Audit ledger |
| `/app/system` | auth (admin-emphasised) | Node, models, mode |
| `/app/night` | auth | Night Ops |
| `/app/archive` | auth | Archive viewer |
| `/console/*`, `/archive`, `/night` | — | permanent redirects |
| `*` | — | 404 with a way back |
