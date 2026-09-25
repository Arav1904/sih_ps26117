# Demo mode and demonstration data

## Two modes

**Demo mode** is the default. The agent timeline, per-step timings, OCR confidences and routing statistics are
deterministic demonstration logic — identical on every machine, which is what makes a demo reproducible and
what stops a chart disagreeing with the sentence beside it.

**Live local mode** (`/app/system`) calls `http://127.0.0.1:8000/healthz`. This prototype ships without that
backend, so the probe fails and the screen says so. That failure is itself a demonstration: the call was
*permitted* by the network policy, because loopback is inside the boundary.

## What is real in both modes

- The egress guard, and the refusal counter
- The audit ledger and its spreadsheet export
- The `.docx`, `.xlsx` and `.py` files — generated in the browser with no library and no network

## Labelling policy

Anywhere a figure is simulated rather than inferred, a `<SimNote>` appears: a small dot and the words *Demo
simulation*, with a tooltip reading "Deterministic demonstration logic — not live model inference".

The policy is deliberate and narrow:

- **Do** label the agent timeline, OCR scores, routing statistics, the overnight queue.
- **Do not** plaster "mock" across the interface. It is subtle, consistent and professional.
- **Never** imply a 70B model is executing in the browser.

`/app/system` and `/security` both state the split in full sentences.

## Demonstration data

**Everything is fictional.** No MRPL document, drawing, equipment tag, rate or procedure is used anywhere.

| Data | Source |
|---|---|
| Unit 04 CDU, V-102, E-210, PSV-04-22, P-31A | invented equipment tags |
| SOP-MI-114, SOP-OP-042, MOC-PR-009, SOP-SF-021, ENG-STD-07, RATE-2026 | invented document codes |
| ISO 5167-2 | a real published standard, referenced by name only |
| Contractor rates, the ₹5,07,360 total | invented |
| OCR confidences (0.96, 0.89, 0.88, 0.68) | fixed demonstration values |
| 158 dispatches over 24 hours | generated once from `mulberry32(26117)` |

The footer on every page says so: *"Prototype demonstration — data shown is fictional."*

## Reproducibility

`telemetry.ts` anchors its window to `Date.UTC(2026, 1, 17, 18, 0, 0)` and seeds its PRNG, so the histogram,
the matrix, the donut and the prose around them show identical numbers on every machine, every time. A
demonstration whose figures move between machines is not a demonstration.

## The guided demo

Eight stops, roughly four minutes, driven from `src/components/GuidedDemo.tsx`. It navigates and narrates in
one line per stop, and starts the inspection run and the code run automatically when it reaches them. It does
not dim the screen, trap focus or block interaction — a judge can leave it running and still click anywhere.

Full narration: `FINAL_DEMO_SCRIPT.md`.
