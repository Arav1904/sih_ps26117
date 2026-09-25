import { useSyncExternalStore } from 'react';
import { egressGuard } from '../services/networkPolicy';
import type { BlockedCall } from '../types';

/** Every external call the page attempted and the guard refused. */
export function useEgress(): BlockedCall[] {
  return useSyncExternalStore(egressGuard.subscribe, egressGuard.getSnapshot, egressGuard.getSnapshot);
}
