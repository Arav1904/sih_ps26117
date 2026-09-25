/* ---------------------------------------------------------------
   KAVACH network policy — the egress guard.

   This is the one part of the prototype that is NOT a simulation.

   It replaces the document's four network primitives — fetch,
   XMLHttpRequest, WebSocket and navigator.sendBeacon — before React
   mounts. Every call the page makes is classified first:

     LOCAL     → the node itself. Passed through to the real
                 primitive, counted, and written to the ledger.
     EXTERNAL  → anything else. Refused before a packet is sent,
                 counted, and written to the ledger.

   The "local" set is deliberately explicit rather than "not
   external", because the production architecture depends on it:
   a FastAPI orchestrator on 127.0.0.1:8000, a vLLM server, a Qdrant
   index and a sandbox runner on a unix socket all have to keep
   working when this guard is installed. A guard that blocked them
   would be blocking KAVACH itself.

   WHAT THIS IS NOT: a host firewall. A browser cannot police its
   operating system. In deployment the same policy is enforced
   outside the browser — egress rules on the node, and a code
   sandbox with no network namespace attached. The Security screen
   says so in those words.
   --------------------------------------------------------------- */

import type { BlockedCall } from '../types';
import { audit } from './audit';

export type Mechanism = BlockedCall['mechanism'];
export type Verdict = 'local' | 'external';

export interface PermittedCall {
  at: number;
  host: string;
  target: string;
  mechanism: Mechanism;
}

/** Hostnames that mean "this machine". */
const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0', '::1', '[::1]', 'kavach.local', 'node.kavach.local']);

/** Schemes that never leave the machine. */
const LOCAL_PROTOCOLS = new Set(['file:', 'blob:', 'data:', 'unix:', 'about:']);

export const LOCAL_SERVICES = [
  { name: 'Orchestrator API', where: 'http://127.0.0.1:8000', what: 'task routing, agent steps, artifact store', allowed: true },
  { name: 'Model server (vLLM / Ollama)', where: 'http://127.0.0.1:8001', what: 'inference for every loaded model', allowed: true },
  { name: 'Vector index (Qdrant)', where: 'http://127.0.0.1:6333', what: 'the SOP and drawing corpus', allowed: true },
  { name: 'Sandbox runner', where: 'unix:/run/kavach/sandbox.sock', what: 'code execution, no network namespace', allowed: true },
  { name: 'Artifact store', where: '/var/kavach/artifacts', what: 'deliverables written to local disk', allowed: true },
  { name: 'Everything else', where: 'any public address', what: 'refused at the guard and recorded', allowed: false },
];

class EgressGuard {
  private blocked: BlockedCall[] = [];
  private permitted: PermittedCall[] = [];
  private internalCalls = 0;
  private listeners = new Set<() => void>();
  private installed = false;

  private realFetch: typeof fetch | null = null;

  /* ------------------------- classification ---------------------- */

  /** Exposed so tests and the Security screen can ask the same
   *  question the interceptors ask, with no side effect. */
  classify(target: string): Verdict {
    const raw = String(target ?? '').trim();
    if (!raw) return 'local';                       // empty target cannot leave
    if (raw.startsWith('unix:') || raw.startsWith('/run/') || raw.startsWith('/var/')) return 'local';

    let url: URL;
    try {
      url = new URL(raw, typeof location !== 'undefined' ? location.href : 'http://localhost/');
    } catch {
      return 'external';                            // unparseable: refuse, do not guess
    }

    if (LOCAL_PROTOCOLS.has(url.protocol)) return 'local';
    if (LOCAL_HOSTNAMES.has(url.hostname)) return 'local';

    /* The origin this document was served from is the node's own web
       surface — fetching the app's own assets is not egress. */
    if (typeof location !== 'undefined' && url.origin === location.origin) return 'local';

    return 'external';
  }

  /* --------------------------- install --------------------------- */

  install(): void {
    if (this.installed || typeof window === 'undefined') return;
    this.installed = true;

    const guard = this;
    this.realFetch = window.fetch ? window.fetch.bind(window) : null;

    /* ---- fetch ---- */
    window.fetch = ((input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      if (guard.classify(url) === 'local') {
        guard.permit(url, 'fetch');
        return guard.realFetch
          ? guard.realFetch(input as RequestInfo, init)
          : Promise.reject(new Error('fetch unavailable in this environment'));
      }
      return Promise.reject(guard.refuse(url, 'fetch'));
    }) as typeof fetch;

    /* ---- XMLHttpRequest ----
       The verdict is taken at open() but only counted at send(), so an
       open() that is never sent never inflates the refusal count. */
    const open = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function (this: XMLHttpRequest & { __kvTarget?: string }, ...args: unknown[]) {
      this.__kvTarget = String(args[1] ?? '');
      return open.apply(this, args as Parameters<typeof open>);
    };

    const send = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function (this: XMLHttpRequest & { __kvTarget?: string }, ...args: unknown[]) {
      const target = this.__kvTarget ?? '';
      if (guard.classify(target) === 'external') {
        guard.refuse(target, 'xhr');
        this.dispatchEvent(new Event('error'));
        return undefined;
      }
      guard.permit(target, 'xhr');
      return send.apply(this, args as Parameters<typeof send>);
    };

    /* ---- WebSocket ---- */
    const OriginalWS = window.WebSocket;
    if (OriginalWS) {
      const Patched = function (this: unknown, url: string | URL, protocols?: string | string[]) {
        const target = String(url);
        if (guard.classify(target) === 'external') throw guard.refuse(target, 'websocket');
        guard.permit(target, 'websocket');
        return new OriginalWS(url, protocols);
      } as unknown as typeof WebSocket;
      Patched.prototype = OriginalWS.prototype;
      /* statics (CONNECTING/OPEN/CLOSING/CLOSED) must survive the swap */
      Object.defineProperties(Patched, {
        CONNECTING: { value: 0 }, OPEN: { value: 1 }, CLOSING: { value: 2 }, CLOSED: { value: 3 },
      });
      window.WebSocket = Patched;
    }

    /* ---- sendBeacon ---- */
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
      const realBeacon = navigator.sendBeacon.bind(navigator);
      navigator.sendBeacon = (url: string | URL, data?: BodyInit | null): boolean => {
        const target = String(url);
        if (guard.classify(target) === 'external') { guard.refuse(target, 'beacon'); return false; }
        guard.permit(target, 'beacon');
        return realBeacon(url, data);
      };
    }
  }

  /* --------------------------- decisions ------------------------- */

  private hostOf(target: string): string {
    try { return new URL(target, location.href).host || 'local'; } catch { return target.slice(0, 40) || 'local'; }
  }

  private refuse(target: string, mechanism: Mechanism): Error {
    const host = this.hostOf(target);
    this.blocked = [{ at: Date.now(), host, target: String(target).slice(0, 160), mechanism }, ...this.blocked].slice(0, 120);
    audit.record('security', 'External call refused — data was not allowed to leave the node', `${host} · ${mechanism}`);
    this.listeners.forEach((f) => f());
    return new Error(`KAVACH network policy: external egress refused (${host})`);
  }

  private permit(target: string, mechanism: Mechanism): void {
    const host = this.hostOf(target);
    this.permitted = [{ at: Date.now(), host, target: String(target).slice(0, 160), mechanism }, ...this.permitted].slice(0, 120);
    this.listeners.forEach((f) => f());
  }

  /** A genuine attempt at a public AI endpoint and a telemetry socket,
   *  for the demonstration. Both are refused before a packet is sent. */
  probe(): void {
    void fetch('https://api.openai.com/v1/chat/completions', { method: 'POST' }).catch(() => undefined);
    try { new WebSocket('wss://telemetry.example.net/ingest'); } catch { /* refused, as intended */ }
    if (typeof navigator !== 'undefined' && navigator.sendBeacon) navigator.sendBeacon('https://analytics.example.com/collect', 'x');
  }

  /** A legitimate call to the local orchestrator, for the demonstration
   *  that the policy is a policy and not a blanket block. In Demo Mode
   *  there is no server listening, so the request fails at the socket —
   *  the point is that the guard let it through. */
  probeLocal(): void {
    void fetch('http://127.0.0.1:8000/healthz').catch(() => undefined);
  }

  /** Tool calls that never touch a socket at all (in-process services). */
  noteInternal(service: string): string { this.internalCalls++; return service; }

  list(): BlockedCall[] { return this.blocked; }
  permittedList(): PermittedCall[] { return this.permitted; }
  count(): number { return this.blocked.length; }
  permittedCount(): number { return this.permitted.length; }
  internal(): number { return this.internalCalls; }

  subscribe = (f: () => void): (() => void) => { this.listeners.add(f); return () => { this.listeners.delete(f); }; };
  getSnapshot = (): BlockedCall[] => this.blocked;
}

export const egressGuard = new EgressGuard();

/** Historical name kept so existing imports and tests keep working. */
export const gate = egressGuard;
