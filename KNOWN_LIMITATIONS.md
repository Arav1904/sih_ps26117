# KAVACH — Known limitations

Written plainly, because a prototype that overstates itself is worth less than one that does not.

## The model inference is simulated

The agent timeline, the per-step timings, the OCR confidence scores and the routing statistics are
deterministic demonstration logic. No 70B model is executing in your browser. Everything simulated carries a
*Demo simulation* label in the interface, and `/app/system` explains the distinction in full.

**What is real:** the network policy, the audit ledger, and the generated `.docx` / `.xlsx` / `.py` files —
produced in the browser with no library and no network, and openable in Word and Excel.

## The sovereignty guard is browser-level, not host-level

It replaces every network primitive the page can reach and refuses external calls before a packet is sent.
That is a genuine demonstration of the policy. It is **not** a host firewall — a browser cannot police its
operating system. In deployment the same policy is enforced by egress rules on the node and a code sandbox
with no network namespace attached.

## Authentication is a demonstration

Frontend-only. Sessions live in `localStorage`. No identity provider, no token, no password hashing, no
recovery, no session expiry, no CSRF surface because there is no server. Accounts created at `/signup` are
stored in plain text in the browser. Do not reuse a real password.

In deployment `src/services/auth.ts` is the single module that gets replaced by the site's LDAP or OIDC
provider. Nothing above it changes.

## There is no backend

`/app/system` offers a *Live local mode* that calls `http://127.0.0.1:8000/healthz`. Nothing is listening,
and the screen says so. The FastAPI orchestrator, vLLM server, Qdrant index and sandbox runner described in
`FINAL_ARCHITECTURE.md` are the integration path, not shipped code.

## Session state does not survive a reload

Runs, artifacts and the audit ledger live in memory for the length of the session. Only the sign-in session
persists. In deployment the ledger is a PostgreSQL table and artifacts are files on disk.

## The corpus is fictional

No MRPL document, drawing, equipment tag, rate or procedure is used anywhere. Unit names, tag numbers, clause
references (`SOP-MI-114 §6.2` and so on) and contractor rates are invented. It is a representative industrial
workflow, not a real one.

## Scope of the demonstration corpus

Four OCR pages of a stated fourteen, four findings, seven models, seven knowledge documents, two task
classes. The screens say "4 of 9 scanned pages shown — the ones the run cited or flagged" rather than
implying the whole document is rendered.

## Indic-language support is declared, not demonstrated

`Sarvam-M` is in the registry and the router has a rule for Devanagari and Kannada input, but no Indic
document is included in the demonstration corpus. The routing screen shows the rule; it does not show a
worked example.

## Accessibility is good, not audited

Keyboard navigation, focus rings, semantic landmarks, `aria-pressed` on toggles, `role="progressbar"` on
meters, skip link, reduced-motion support and 40px minimum targets are all in place and were checked by hand.
No screen-reader audit with an actual assistive technology has been run.

## No automated visual regression

`npm test` covers types, all 21 routes, guarded routes, the agent run, the network policy in both directions,
authentication, logout, OOXML output and the air-gap check. It does not take screenshots. Responsive layout
was verified against the token breakpoints by inspection, not by a headless browser.

## Browser support

Modern evergreen browsers. The build targets ES2020. `Object.defineProperties` on the patched `WebSocket`,
`URL`, `useSyncExternalStore` and CSS custom properties in SVG attributes are all assumed available.
