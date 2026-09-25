/* Compatibility shim.

   The egress guard moved to `networkPolicy.ts` in Phase 5, where it
   gained an explicit local-allow path so a real local backend can be
   added without the guard blocking the product's own architecture.
   This file re-exports it so older imports keep resolving. */
export { egressGuard, gate, LOCAL_SERVICES } from './networkPolicy';
export type { Mechanism, Verdict, PermittedCall } from './networkPolicy';
