import type { AuditClass, AuditEvent } from '../types';

/* Append-only ledger. In deployment this is a PostgreSQL table; here it
   lives in memory and is written by the same call sites. */
class AuditService {
  private events: AuditEvent[] = [];
  private counter = 0;
  private listeners = new Set<() => void>();

  record(cls: AuditClass, message: string, detail = ''): number {
    this.events = [{ seq: ++this.counter, at: Date.now(), cls, message, detail }, ...this.events].slice(0, 400);
    this.listeners.forEach((f) => f());
    return this.counter;
  }

  list(): AuditEvent[] { return this.events; }
  count(): number { return this.events.length; }
  subscribe = (f: () => void): (() => void) => { this.listeners.add(f); return () => this.listeners.delete(f); };
  getSnapshot = (): AuditEvent[] => this.events;
}

export const audit = new AuditService();
