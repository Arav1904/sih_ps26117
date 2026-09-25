# KAVACH design system

## The rule

**Black + off-white + burgundy is the product.** Purple and warm exist as accents and may colour a dot, a
hairline, one chart series, a small badge or a single glow. They may never own a page background or a surface.

| Token | Value | Use |
|---|---|---|
| `--color-black` | `#0A0A0A` | top bar, footer, dark sections, hero |
| `--color-paper` | `#F5F3F1` | the main light canvas |
| `--color-surface` | `#FFFFFF` | panels |
| `--color-ink` | `#131110` | primary text |
| `--color-muted` | `#66605D` | secondary text |
| `--color-border` | `#DEDAD6` | hairlines |
| `--color-burgundy` | `#6D001A` | **the** accent — one per screen, never decorative |
| `--color-purple` | `#2B124C` | Night Ops marker only |
| `--color-warm` | `#DC586D` | hero glow only |

Full token set: `src/styles/tokens.css`. Nothing in the codebase writes a hex value outside that file except
`src/components/charts.tsx` (inherited from v2) and the SVG diagrams, which reference `var(--color-*)` directly.

## Typography

- **Archivo** (500/600/700/800) — headings, brand, stat values, button labels
- **JetBrains Mono** (400/500) — metrics, logs, IDs, timestamps, status labels, eyebrows
- **Courier Prime** (400) — inside the Archive document viewer only

All three are bundled via `@fontsource`, not fetched. Body text never goes below 13px; 11px is reserved for
compact metadata. Monospace is for machine-produced values, never for prose.

## Spacing

A 4px scale, `--s-1` (4px) through `--s-12` (128px). Section rhythm is `--s-9` (56px) desktop, `--s-8` mobile.
Panels are `--s-6` (24px) padded, `--s-5` at 768px, `--s-4` at 480px.

The brief asked for *more spacious*. A longer page is preferred to a denser one — that is why the agent run is
four stacked sections rather than one grid.

## Motion

- `--dur-fast` 120ms · `--dur-base` 220ms · `--dur-slow` 420ms · `--dur-slower` 900ms
- Only `transform` and `opacity` are animated, plus `width`/`height` on meters and the timeline fill.
- Keyframes live in `base.css`: `kv-rise`, `kv-fade`, `kv-grow`, `kv-pulse`, `kv-ring`, `kv-sweep`, `kv-shimmer`.
- `prefers-reduced-motion: reduce` collapses every animation and transition to 1ms, and `CountUp` and
  `HeroPipeline` check the media query in JS as well, because a counter that still ticks is still motion.

No blur filters, no particles, no video, no continuous background animation.

## Components

`src/components/ui.tsx` — `Panel`, `SectionHead`, `Button`, `Stat`, `Row`, `Badge`, `Dot`, `Conf`,
`Disclosure`, `Empty`, `Meter`, `Callout`, `SimNote`, `Tabs`, `Modal`, `ToastTray`, `CountUp`.

`src/components/diagrams.tsx` — `WorkflowSpine`, `HeroPipeline`, `BoundaryDiagram`, `RoutingFlow`, `Donut`,
`Sparkline`, `ArchitectureStack`, `ScanAnimation`.

`src/components/charts.tsx` — `BarRows`, `Histogram`, `Matrix`, `Gantt`, `ConfidenceChart`, `EgressChart`,
`VramBar`, `PageScan`. All hand-drawn SVG. No chart library, ever — an air-gapped build should not carry a
charting runtime to draw eight figures.

**If a screen needs a one-off style, the primitive gets a variant.** No page defines its own component.

## The three-level information model

Every screen obeys it:

1. **Level 1** — a plain sentence. *"KAVACH chose the vision model."*
2. **Level 2** — a picture. `RoutingFlow`, `WorkflowSpine`, `BoundaryDiagram`.
3. **Level 3** — `<Disclosure summary="Technical details">`. Model IDs, context windows, latency, the dispatch
   matrix, raw tool output.

No screen forces level 3 before level 1. The test applied to every primary string: *would a first-year student
understand what happened?*

## Breakpoints

1440 · 1280 · 1024 · 768 · 480 · 390 · 360.

- 1080 — the desktop nav collapses into the drawer
- 1024 — `.grid.wide-first` becomes one column
- 768 — the workflow spine turns vertical; panel padding drops
- 480 — every grid becomes one column

Wide content (Gantt, matrix, VRAM bar, boundary diagram) sits inside `.chart-scroll`, which scrolls itself
rather than pushing the page body sideways.
