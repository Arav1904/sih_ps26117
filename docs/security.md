# KAVACH security model

## The egress guard

`src/services/networkPolicy.ts`. Installed from `main.tsx` **before React mounts**, which is what makes the
guarantee meaningful — nothing the application does afterwards can reach the network without passing it.

It replaces four primitives: `fetch`, `XMLHttpRequest`, `WebSocket`, `navigator.sendBeacon`.

### Classification

```
localhost · 127.0.0.1 · 0.0.0.0 · ::1 · kavach.local   → local
file: · blob: · data: · unix: · /run/… · /var/…         → local
same origin as this document                            → local
anything else                                           → external
a target that will not parse                            → external (refused, not guessed at)
```

Local calls are **passed through to the real primitive** and counted. External calls are refused before a
packet is sent, counted, and written to the audit ledger with the mechanism that attempted them.

### Why the local allow path exists

The v2 guard refused everything, loopback included. The production architecture is a FastAPI orchestrator on
`127.0.0.1:8000`, a model server, a Qdrant index and a sandbox runner on a unix socket. A guard that blocked
those would be blocking KAVACH itself. The demonstration button **Call the local node** on `/app/sovereignty`
exists to show this: the call is permitted, and the refusal counter does not move.

### Fixes to the v2 implementation

| v2 | v3 |
|---|---|
| Refusal recorded at `XMLHttpRequest.open()` | Recorded at `send()`, so an unsent request no longer inflates the counter |
| Patched `WebSocket` lost `OPEN`/`CLOSED`/… | Statics restored via `Object.defineProperties` |
| No allow path | Explicit local allow list |
| `probe()` fired fetch + WebSocket | Also fires a beacon, so all three mechanisms are demonstrated |

### Tested

`tests/behaviour.mjs` asserts: loopback is local, localhost is local, a unix socket is local, a same-origin
relative path is local, a public host is external, a malformed URL is external, external calls are refused by
each mechanism, refusals reach the ledger, every refusal names a host, a local call is permitted, and a local
call does not inflate the refusal count.

## Scope — stated the same way on screen and here

**Covered:** every network primitive the page can reach.

**Not covered:** the host. A browser cannot police its operating system. In deployment the same policy is
enforced outside the browser — egress rules on the node, container isolation for the model server, and a code
sandbox with no network namespace attached.

The Security and Data-boundary screens say exactly this. Preserving that precision was a deliberate decision:
an overclaim here would undo the point of the product.

## Offline operation

The build fetches nothing. v2 loaded three typefaces from `fonts.googleapis.com`, which in a problem statement
about air-gapped operation was the sharpest self-inflicted wound in the codebase. v3 bundles them.

`tests/offline-check.mjs` walks `dist/` and fails on:

- any absolute `src=` or `href=` in HTML
- any external `url()` in CSS or JS
- any URL literal in JS that is not on a short documented list (React's error-decoder string, loopback
  addresses, the deliberate probe targets, and XML namespace identifiers)

A new external dependency cannot land unnoticed.

## Authentication

Demonstration only. See `KNOWN_LIMITATIONS.md`. `src/services/auth.ts` is the single seam that a real LDAP or
OIDC integration replaces.

## Sandbox constraints (declared, for the production design)

No network namespace · read-only rootfs with one writable `/tmp` · 2 GiB memory · 2 cores, 10s wall clock ·
all capabilities dropped, non-root · container destroyed after the run.

Shown on `/app/sandbox` and `/security`.
