# KAVACH Design Language — v1 (locked)

**Product:** KAVACH — sovereign on-premise agentic AI workbench, SIH 2026 PS26117 (MRPL), Team TokenGods
**System:** one signature accent color used across four purpose-built surfaces. Never invent a fifth surface or a new accent without deliberate reason — extend within this system, don't replace it.
**Companion file:** `kavach_combined_system.html` — the four surfaces below, coded and in order. Treat its hex values as source of truth over any value restated here.

## The rule in one line
Pick the surface by **what the screen is for**, not by preference. Every screen belongs to exactly one surface. Never blend two surfaces on one screen.

| Surface | Use for | Background | 
|---|---|---|
| **1. Landing** | Public/marketing pages only: homepage, pitch intro, about | Warm gradient |
| **2. Console** | Every working screen: dashboard, routing, agent runs, deliverables, ledger | Black / white / burgundy |
| **3. Archive** | Any screen showing one opened document/file/case record | Cream paper |
| **4. Night Ops** | Optional low-stimulation toggle for unattended/overnight monitoring | Deep purple |

## Signature accent
`#6D001A` (burgundy) is the one color that appears on all four surfaces regardless of backdrop — it's what makes them read as one product. It marks accent/action/alert only:
- Console: the access spine, numbered markers, "ASK KAVACH" label, active persona/button state
- Archive: the confidentiality tag/stamp
- Night Ops: the alert dot only (`#C2185B`, a rose drawn from the same family — night mode is too dark for pure `#6D001A` to read)
- Landing: selected persona pill, preview-card border

Never use it as a large background fill outside the console's access spine and tags. Never use it as body text on a light background (fails contrast against cream).

## Surface tokens

**1. Landing** (gradient, only surface allowed one)
`bg: linear-gradient(165deg, #FFBB94 0%, #FB9590 24%, #DC586D 52%, #A33757 76%, #4C1D3D 100%)` · text `#FFFFFF` with a soft text-shadow on headlines · body chips `rgba(255,255,255,.9)` on `#4C1D3D`-ish ink

**2. Console**
`nav bg #0A0A0A` · `nav text #C9C9C9` (active `#FFFFFF`) · `accent spine bg #6D001A` · `main bg #F5F3F1` · `main text #131110` · `secondary text #66605D` / `#928C88` · `border #DEDAD6`

**3. Archive**
`page bg #EEE4DA` · `card bg #F7F1EA` · `border #D8C4AC` · `heading #3B2A22` · `secondary #A88A76` / `#9E7A63` · `tag bg #6D001A` on `#F7E6EA` text

**4. Night Ops**
`bg #190019` · `panel/divider #2B124C` · `primary text #FBE4D8` · `secondary text #DFB6B2` · `muted rows #854F6C` · `alert dot #C2185B`

## Typography (same two faces everywhere — don't add a third except where noted)
- **Archivo** (600–800) — all headlines, wordmarks, brand
- **JetBrains Mono** (400–700) — all data, labels, nav, inputs, buttons
- **Courier Prime** — Archive surface only, for scanned/typewriter-feel body text

## Shared components (reuse, don't redesign)
- **Shield mark**: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2 L20 5 V11 C20 17 16.5 20.5 12 22 C7.5 20.5 4 17 4 11 V5 Z"/></svg>` — always paired left of "KAVACH" wordmark, stroke color = that surface's ink color
- **Data row**: label left, value right, hairline border-bottom — used for findings, routing, ledger everywhere
- **Confidence tag**: a value + status word (`0.94` / `0.61 · held`) always travels together — never show a redacted/low-confidence line without its score
- **Ask bar**: single-line input, present on every surface, restyled per surface but always same function — issuing an agent command, never a chat bubble

## Readability rules (non-negotiable)
1. Body/data text never below **11px**; reading content (findings, findings sub-text) never below **13px**.
2. On Landing: headline text is always white-on-gradient with shadow; never place body copy directly on the palette without a solid card/pill behind it.
3. Line-height ≥ 1.4 anywhere prose wraps to a second line.
4. Every redaction/held state must show its confidence number beside it — redaction alone with no label is not allowed.
5. Before shipping any new screen, contrast-check text against its actual background (don't assume — verify at build time).

## Don'ts
- No gradients outside Landing.
- No glassmorphism, blur panels, or soft drop-shadow cards (flat surfaces only — the outer frame box-shadow in the demo file is the one exception, for on-page separation).
- No chat-bubble UI anywhere — KAVACH is an instrument/document interface, not a chat app.
- No new accent colors. If a screen needs a status color beyond burgundy (success/warning), derive it from what's already in that surface's own family, not a fresh hue.
- No mixing surfaces on one screen (e.g. no burgundy console spine appearing inside an Archive-surface screen's layout — Archive gets the tag only, not the spine).

## For whoever (human or Claude) builds the next screen
1. Identify which of the 4 surfaces this screen belongs to using the table above.
2. Pull that surface's tokens verbatim from `kavach_combined_system.html`.
3. Reuse the shared components before inventing new UI patterns.
4. Check the 5 readability rules before calling it done.
5. If truly unsure which surface fits, default to **Console** — it's the primary working surface and covers most screens.
