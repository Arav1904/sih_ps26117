# KAVACH — Baseline (pre-redesign)

Captured 2026-09-16 from the supplied `KAVACH_SIH26_PS26117_build.zip`, commit `dd79ea7`.
Everything later phases claim as an improvement is measured against this file.

## Toolchain

```
node v22.22.2 · npm 10.9.7
npm install   → 130 packages, 3s
npm run build → ✓ built in 1.93s
npm test      → all checks passed
```

## Build output

| Asset | Raw | Gzip |
|---|---|---|
| `dist/index.html` | 0.92 kB | 0.51 kB |
| `dist/assets/index-*.css` | 12.71 kB | 3.33 kB |
| `dist/assets/index-*.js` | 247.41 kB | 80.56 kB |

59 modules transformed. No code splitting — one chunk for all 10 routes.

## Route census (jsdom, text length and SVG count)

| Route | chars | svg | notes |
|---|---:|---:|---|
| `/` | 1957 | 1 | landing, gradient surface |
| `/console` | 2870 | 3 | overview |
| `/console/sovereignty` | 2594 | 2 | egress monitor |
| `/console/routing` | 4444 | 3 | matrix + bars |
| `/console/run` | 4069 | 2 | agent run |
| `/console/sandbox` | 4030 | 3 | code repair |
| `/console/document` | 3516 | 3 | OCR + drawing |
| `/console/ledger` | 1924 | 2 | audit |
| `/archive` | 1269 | 1 | paper viewer |
| `/night` | **227** | 1 | Night Ops — thinnest route in the build |

## Behaviour checks (all passing at baseline)

```
run reaches a finish time
every step settled
two attention steps flagged (2)
two deliverables written (2)
ledger grew during the run (1 -> 15)
deliverable text on screen
outbound attempts refused (0 -> 2)
refusals reach the ledger
nothing permitted
code run produces one deliverable
no console errors
```

## External network dependencies at baseline

| Resource | Host | Status |
|---|---|---|
| Archivo, JetBrains Mono, Courier Prime | `fonts.googleapis.com`, `fonts.gstatic.com` | **external — must be removed** |
| Everything else | — | none. No CDN, no analytics, no images, no cloud AI |

## Known-good behaviour to preserve

- Deterministic agent timeline driven from `SCENARIOS[key].steps`.
- Real `.docx` / `.xlsx` generation with no dependency (`src/lib/ooxml.ts`).
- Seeded telemetry (`mulberry32(26117)`) so every machine shows the same figures.
- `fetch` / `XHR` / `WebSocket` / `sendBeacon` interception installed before React mounts.
- OCR confidence threshold of 0.85 with a page genuinely held back from the deliverable.
- Two attention steps in the inspection run; 2/7 → 7/7 tests in the code run.
