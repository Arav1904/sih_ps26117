# KAVACH — Architecture

v3.0.0 · SIH 2026 PS26117

## Shape

```
  Browser (this repository)
  ─────────────────────────────────────────────────────────────
   main.tsx        egressGuard.install() → auth.restore() → store.boot()
       │            (order matters: the guard is in place before React)
       ▼
   App.tsx         routes · RequireAuth · ErrorBoundary · GuidedDemo
       │
       ▼
   pages/          19 screens, all inside one <Shell>
       │
       ▼
   components/     Shell · ui primitives · diagrams · charts
                   AskKavach · AgentTimeline
       │
       ▼
   state/          store (runs, artifacts, mode, guided demo)
                   useAuth · useEgress · useAudit
       │
       ▼
   services/       networkPolicy · auth · agent · artifact · audit
                   knowledge · modelRouter · ocr
       │
       ▼
   data/           corpus · scenarios · telemetry · stages
                   (fictional, deterministic, seeded)
  ─────────────────────────────────────────────────────────────
       ⇣ the seam, not yet built
   Local API (FastAPI) → task router → model service (vLLM/Ollama)
                       → vector index (Qdrant) → agent tools
                       → sandbox runner → artifact store → audit log
```

## Layers, and what each one owns

| Layer | Owns | Does not own |
|---|---|---|
| `data/` | The fictional corpus, the seeded telemetry log, the scenario definitions, the seven stages | Any rendering decision |
| `services/` | Network policy, authentication, audit, OCR, knowledge, routing, artifact writing | React state |
| `state/` | The run timeline, artifacts, mode, guided-demo position | Anything visual |
| `components/` | Primitives, diagrams, shell | Business rules |
| `pages/` | Composition only — every page is primitives plus copy | Bespoke styling |

The rule that keeps this honest: **if a screen needs a one-off style, the primitive gets a variant.** No page
introduces a colour, a spacing value or a component of its own.

## The workflow spine

`src/data/stages.ts` defines seven stages. Every `AgentStep` in `src/data/scenarios.ts` declares which one it
belongs to. `WorkflowSpine` renders them on the landing page, the dashboard, the agent run and the sandbox.
`AgentTimeline` groups a run's steps under them.

This is why a visitor who understands one screen understands all of them.

## State

One store, `useSyncExternalStore`, no library.

```ts
AppState = {
  booted, mode: 'demo' | 'live', liveUnavailable,
  scenario, inputs, prompt,
  run: RunRecord | null, history, artifacts,
  guided: number | null,
}
```

`store.start(key)` walks `SCENARIOS[key].steps`, marking each `active`, then `done` or `attention` on its
declared duration, recording an audit line and a tool call as it goes.

Three other subscribable singletons sit alongside it, each with its own hook: `auth`, `audit`, `egressGuard`.

## The backend seam

`store.start()` is the only place the simulation lives. Replacing the timer with a stream is the whole
integration:

```ts
// today
this.timers.push(window.setTimeout(() => { /* mark step i settled */ }, step.durationMs));

// with an orchestrator
for await (const event of orchestrator.run(taskId)) {
  // event has the shape of AgentStep: { title, tool, stage, why, detail, attention }
  applyStepEvent(event);
}
```

Nothing above `state/` changes. The types in `src/types.ts` are the contract the backend must emit.

Proposed local services, all on loopback or a unix socket, all already on the network policy's allow list:

| Service | Address | Job |
|---|---|---|
| Orchestrator API (FastAPI) | `127.0.0.1:8000` | task routing, agent steps, artifact store |
| Model server (vLLM / Ollama) | `127.0.0.1:8001` | inference for every loaded model |
| Vector index (Qdrant) | `127.0.0.1:6333` | the SOP and drawing corpus |
| Sandbox runner | `unix:/run/kavach/sandbox.sock` | code execution, no network namespace |
| Artifact store | `/var/kavach/artifacts` | deliverables on local disk |

**No backend was added for this prototype.** Adding one for demonstration authentication alone would have
described an architecture the prototype does not have. The frontend is written so that when a real backend
arrives, no screen moves.

## Notable implementation choices

**`HashRouter` + `base: './'`** — so `dist/index.html` opens from `file://` on an air-gapped machine with no
server, and so Vercel needs no rewrite rules.

**Eager route imports** — the bundle is 351 kB (110 kB gzip) in one chunk. A second chunk would need a server
to fetch it from, which defeats the USB-stick scenario.

**Hand-drawn SVG charts** — no chart library. Every chart reads the same array the surrounding prose reads, so
the numbers cannot disagree with the sentences around them.

**Seeded telemetry** — `mulberry32(26117)` generates the 158-dispatch log once, so every machine shows
identical figures and a demo is reproducible.

**`src/lib/ooxml.ts` untouched from v2** — a store-only ZIP writer that produces byte-identical real `.docx`
and `.xlsx` files with no dependency and no network. It was the best thing in the v2 codebase and it was not
improved.
