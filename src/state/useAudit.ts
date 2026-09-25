import { useSyncExternalStore } from 'react';
import { audit } from '../services/audit';
import type { AuditEvent } from '../types';

export function useAudit(): AuditEvent[] {
  return useSyncExternalStore(audit.subscribe, audit.getSnapshot, audit.getSnapshot);
}
