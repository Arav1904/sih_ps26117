# KAVACH — Final audit report

The second, independent pass: problems found after the brief's requested changes were implemented, and what
was done about each one. Everything listed as *fixed* is fixed in this build, not noted for later.

---

## A. Problems found and fixed

### A1 · The mobile sign-in screen lost the demo credentials — **fixed**
`.auth-aside` is `display: none` below 900px. That sidebar is the only place the demo accounts and the password
appear. A judge opening the demo on a phone had no way to find out how to sign in. Added a **Show the demo
accounts** button that appears only below 900px and opens the account list in a modal.

This also retired the only unused primitive in the library.

### A2 · Three services had become dead code — **fixed**
`agent.ts` and `modelRouter.ts` survived the rewrite but nothing imported them. Rather than delete a
deliberately-drawn seam, both were wired into the screens that should have been using them: `agent.isRunning()`
on the agent run and the sandbox, `modelRouter.loaded()` / `.vramCommitted()` / `.families()` on the system
screen. The `families()` count replaced a duplicated "average time on task" stat that already appeared in the
panel note two inches away.

### A3 · `SUGGESTIONS` was exported and never rendered — **fixed**
The brief explicitly asks for example prompts under the command bar. They existed in the module and were not
drawn. They are now chips that fill the input.

### A4 · A skeleton loader was defined and never used — **removed**
`.skeleton` plus its keyframe shipped in the CSS with nothing rendering it. There is no real latency anywhere
in this prototype, so a skeleton would have been fake waiting, which the brief specifically warns against. Both
the class and the keyframe were deleted rather than left as dead weight.

### A5 · The XHR refusal counter could be inflated — **fixed**
v2 recorded a refusal in `XMLHttpRequest.prototype.open`. An `open()` that was never `send()`-ed still
incremented the counter the Security screen presents as a true count. The verdict is now taken at `open()` and
only counted at `send()`.

### A6 · The patched `WebSocket` lost its statics — **fixed**
`Patched.prototype = OriginalWS.prototype` copies the prototype but not `WebSocket.OPEN`, `CLOSED` and friends.
Any code reading them got `undefined`. Restored with `Object.defineProperties`.

### A7 · The guard blocked the product's own architecture — **fixed**
The largest engineering finding. v2 refused *every* call including loopback. The production design is a FastAPI
orchestrator on `127.0.0.1:8000`, a model server, a Qdrant index and a sandbox on a unix socket. Shipping a
guard that blocks those is shipping a dead end. `networkPolicy.ts` now classifies explicitly and permits local
traffic, and `/app/sovereignty` has a button that demonstrates it.

### A8 · The ledger asserted a user that did not exist — **fixed**
v2 wrote `eng.sharma · LDAP · role: inspection engineer` into the audit ledger at boot, with no authentication
behind it. In an audit-trail product that is not a cosmetic problem. The session line now reads the real
demonstration session, and says *demonstration sign-in* in the detail field.

### A9 · Unknown routes silently redirected to the landing page — **fixed**
`<Route path="*" element={<Navigate to="/" />}>` hides typos and broken links. There is now a 404 screen that
says what happened and offers two ways back.

### A10 · Nothing contained a render failure — **fixed**
No error boundary anywhere. One throwing screen took the product down and showed a blank page. `ErrorBoundary`
now catches it, shows a sentence and two buttons, and puts the message behind a *Technical details* disclosure.

### A11 · Downloads had no failure path — **fixed**
`downloadArtifact` and the ledger export assumed `URL.createObjectURL` and the click would work. Both are now
wrapped, and both report success or failure through the toast tray rather than failing silently.

### A12 · Charts pushed the page sideways on small screens — **fixed**
The Gantt, matrix, VRAM bar, confidence chart and boundary diagram have fixed `viewBox` widths with label
gutters up to 208px. Below about 420px their labels collapsed and the page scrolled horizontally. Every wide
chart now sits inside `.chart-scroll`, which scrolls itself and has a `min-width` on the SVG so the labels stay
legible.

### A13 · Clickable `<div>`s throughout — **fixed**
v2 used `onClick` on `div`s for agent steps, OCR regions and findings. Not focusable, not keyboard-operable, no
role. `Row` now renders a real `<button>` with `aria-pressed` when it is given an `onClick`, and the timeline
step header is a `<button>` with `aria-expanded`.

### A14 · Reduced motion was CSS-only — **fixed**
The v2 media query stopped CSS animation but nothing else. `CountUp` and `HeroPipeline` now check
`matchMedia('(prefers-reduced-motion: reduce)')` in JavaScript too, because a counter that still ticks and a
pipeline that still cycles are still motion.

### A15 · Numbers could drift from prose — **checked, held**
The v2 discipline of having every chart read the same array the surrounding sentence reads was preserved
everywhere, including in the new donut, sparkline and boundary diagram. The one figure that is computed twice —
tests passing before and after the patch — derives both values from `TESTS` rather than from literals, and the
sandbox counter is tied to the actual patch step index so the 2/7 → 7/7 transition happens when the patch
lands, not on a timer.

### A16 · `index.html` still preconnected to Google — **fixed**
Removing the stylesheet link without removing the two `<link rel="preconnect">` tags would have left two DNS
lookups to `fonts.googleapis.com` and `fonts.gstatic.com` on every load. Both are gone, and
`tests/offline-check.mjs` would now fail the build if either came back.

---

## B. Deliberate non-changes

**`src/lib/ooxml.ts` was not touched.** A dependency-free store-only ZIP writer producing byte-identical real
Office files is the best thing in the codebase. It was left exactly as it was.

**The seeded telemetry was not regenerated.** Every figure in the product traces to `mulberry32(26117)`.
Changing the seed would have changed every number in every screenshot for no gain.

**The honest browser-vs-host framing was preserved word for word.** v2 was careful about the limits of what a
browser guard proves. That precision is the most credible thing on the Security screen and it survived intact.

**No skeleton loaders were added.** There is no real latency to mask. The brief says to avoid fake waiting and
it is right.

**No chart library was added.** Eight hand-drawn SVG charts is less code than the import statement for a
charting runtime, and an air-gapped build should not carry one.

**No backend was added.** Adding a server purely to host fake authentication would have described an
architecture the prototype does not have.

---

## C. The 26 final questions, answered

| # | Question | Answer |
|---|---|---|
| 1 | Can a naive user understand KAVACH? | Yes — seven plain words, no AI vocabulary on any primary surface |
| 2 | Can a judge understand the PS mapping? | Yes — the PS line is printed at the top of each screen that answers one |
| 3 | Does the product feel visually unified? | Yes — one shell, one token file, one palette on all 19 screens |
| 4 | Is burgundy clearly the primary accent? | Yes |
| 5 | Are purple and warm restrained? | Yes — one band edge and one dot; one hero glow. Neither owns a background |
| 6 | Does the dashboard feel like the console? | Yes — same shell, same primitives |
| 7 | Does Night Ops feel like the same product? | Yes — same chrome, purple as a marker only |
| 8 | Does KAVACH feel more agentic? | Yes — staged timeline, plan announcement, per-step reasons, watchable execution |
| 9 | Is the chat/command interaction easy? | Yes — one box, Enter to send, suggestion chips, a plan, a Run button |
| 10 | Is the agent workflow obvious? | Yes — the spine appears on four screens and groups the timeline |
| 11 | Is sovereignty visually demonstrated? | Yes — boundary diagram, live counter, two buttons that prove both directions |
| 12 | Is uncertainty clearly shown? | Yes — held pages, a Human review required callout, a flagged deliverable |
| 13 | Are simulated capabilities honestly labelled? | Yes — `SimNote` throughout, plus `/app/system` and `/security` |
| 14 | Is the app usable offline? | Yes — `dist/index.html` opens from `file://`, enforced by a test |
| 15 | Zero unnecessary external dependencies? | Yes — three font packages, no CDN, no analytics, no chart library |
| 16 | Does login work? | Yes — three roles, alias account, validation, persistence |
| 17 | Does logout work? | Yes — clears session, storage and workspace; asserted in tests |
| 18 | Do all routes work? | Yes — 21 routes green, plus legacy redirects and a 404 |
| 19 | Are all buttons functional? | Yes — no placeholder, no "coming soon" |
| 20 | Are all tests passing? | Yes — 21 routes, 33 behaviour checks, OOXML, air-gap |
| 21 | Does the production build succeed? | Yes — 353 kB JS / 110 kB gzip, 43 kB CSS / 8.5 kB gzip |
| 22 | Does mobile work? | Yes — drawer nav, single-column grids, vertical spine, scrolling charts, modal credentials |
| 23 | Are animations performant? | Yes — transform and opacity only, reduced-motion honoured in CSS and JS |
| 24 | Is the interface readable? | Yes — 13px floor for reading text, 11px for metadata only |
| 25 | Can another Claude continue from the handoff? | Yes — `docs/handoff/FINAL_HANDOFF.md` is self-contained |
| 26 | Does the ZIP contain everything? | Yes — source, tests, scripts, config, docs, handoffs, lockfile |

---

## D. What a next session should look at first

Not defects — the build is clean. These are the honest next steps.

1. **Build the FastAPI orchestrator.** The seam is drawn and the network policy already permits it. This is the
   single largest credibility gain available.
2. **Add an Indic worked example.** The router has the rule and the registry has the model, but the corpus has
   no Devanagari or Kannada document, so the claim is declared rather than demonstrated.
3. **Run a real screen-reader pass.** The semantics are right by inspection; they have not been heard.
4. **Add a headless-browser responsive test.** Layout was verified against the token breakpoints by hand.
5. **Persist the ledger.** It currently lives for the length of the session. A judge who reloads loses it.
