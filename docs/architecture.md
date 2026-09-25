# Module reference

Companion to `FINAL_ARCHITECTURE.md`, which covers the shape. This one covers what each file is for.

## Entry

| File | Job |
|---|---|
| `index.html` | No external stylesheet, font or script. One root div. |
| `src/main.tsx` | `egressGuard.install()` → `auth.restore()` → `store.boot()` → mount. The order is the guarantee. |
| `src/App.tsx` | 21 routes, `RequireAuth`, `ErrorBoundary`, `GuidedDemo`, legacy redirects, 404. |

## Data (`src/data/`) — fictional, deterministic, seeded

| File | Contents |
|---|---|
| `corpus.ts` | 7 models, 7 knowledge documents, 4 findings, a 9-row estimate, 4 OCR pages, the broken and fixed Python, 7 test cases, sandbox limits. **Unchanged from v2 except additively.** |
| `scenarios.ts` | The two task classes. Each step declares `stage`, `tool`, `durationMs`, `why`, `detail` and optional `attention`. Adding a third task class is one entry here. |
| `telemetry.ts` | 158 dispatches generated once from `mulberry32(26117)`, plus aggregators (`byModel`, `byClass`, `matrix`, `hourly`). Every routing figure in the product reads these. |
| `stages.ts` | The seven stages of the workflow spine. |

## Services (`src/services/`)

| File | Job |
|---|---|
| `networkPolicy.ts` | The egress guard. Classify → allow local / refuse external. Not a simulation. |
| `securityMonitor.ts` | Compatibility re-export of the above, so v2 import paths still resolve. |
| `auth.ts` | Demonstration authentication. Three roles, `localStorage`, the seam a real IdP replaces. |
| `audit.ts` | Append-only in-memory ledger, 400 events, sequence numbers never reused. |
| `agent.ts` | Progress, current index, is-running. Thin by design — the seam for a streaming orchestrator. |
| `modelRouter.ts` | Registry queries: loaded models, VRAM committed, distinct families, route for a scenario. |
| `knowledge.ts` | Documents, indexed subset, passage count, citations, search. |
| `ocr.ts` | Pages, below-threshold pages, mean confidence. `OCR_THRESHOLD = 0.85`. |
| `artifact.ts` | Builds the approval note from application state (not hard-coded prose) and writes real files. |

## Lib (`src/lib/`)

| File | Job |
|---|---|
| `ooxml.ts` | Store-only ZIP writer, `buildDocx`, `buildXlsx`, `utf8`, `crc32`. No dependency, no network, byte-identical output. **Do not "improve" this.** |
| `classify.ts` | Keyword rules standing in for the classifier model. Returns the contract a real classifier must emit. |
| `format.ts` | `clock`, `seconds`, `inr`, `pct`, `seq`. |

## State (`src/state/`)

`store.ts` (runs, artifacts, mode, guided demo) plus three hooks — `useAuth`, `useEgress`, `useAudit` — each
wrapping a service singleton in `useSyncExternalStore`.

## Components (`src/components/`)

| File | Job |
|---|---|
| `Shell.tsx` | `TopBar`, `UserMenu`, `Drawer`, `SiteFooter`, `Shell`. One navbar for the whole product. |
| `ui.tsx` | Every primitive. |
| `icons.tsx` | 27 hand-drawn 24×24 strokes plus `TOOL_ICONS`, mapping a tool name to its glyph. |
| `diagrams.tsx` | Conceptual visuals — spine, hero pipeline, boundary, routing flow, donut, sparkline, architecture stack, scan. |
| `charts.tsx` | Data charts, inherited from v2 and kept. |
| `AgentTimeline.tsx` | The centrepiece. Groups steps by stage, per-step disclosure. |
| `AskKavach.tsx` | The command centre. Classifies, shows a plan, starts the matching run. |
| `GuidedDemo.tsx` | Eight-stop walkthrough with its own bar. |
| `RequireAuth.tsx`, `ErrorBoundary.tsx`, `PageHead.tsx` | Route guard, failure containment, page opener. |

## Pages (`src/pages/`)

19 screens. Public: `Landing`, `HowItWorks`, `Capabilities`, `SecurityPublic`, `Login`, `Signup`, `NotFound`.
Workbench: `Dashboard`, `Work`, `AgentRun`, `DocumentTask`, `Knowledge`, `Sandbox`, `Routing`, `Sovereignty`,
`Ledger`, `System`, `NightOps`, `Archive`.

Every page is composition only. None of them defines a component or a colour.

## Tests (`tests/`, `scripts/test.mjs`)

```
tsc -b --force                    types
esbuild tests/.entry-app.tsx      one iife bundle for jsdom
tests/smoke.mjs                   21 routes: public, signed-in, guarded
tests/behaviour.mjs               33 checks: auth, policy, run, egress, logout
tests/ooxml-check.mjs             writes a real .docx and .xlsx to tests/.out
tests/offline-check.mjs           walks dist/ for external references
```
