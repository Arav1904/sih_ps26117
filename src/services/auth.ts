/* ---------------------------------------------------------------
   DEMONSTRATION AUTHENTICATION — read this before judging it.

   This is a prototype sign-in. It runs entirely in the browser and
   keeps its session in localStorage. There is no identity provider,
   no password hashing, no token, no server. It exists so the demo
   has a real "enter the workbench" moment, roles that change what
   the navigation offers, and a logout that genuinely clears state.

   In deployment this module is the single seam that gets replaced:
   `login()` calls the site's LDAP/AD or OIDC provider, `session()`
   reads a signed token, and nothing above this file changes.

   No backend was added for this. Adding one would have described an
   architecture the prototype does not have.
   --------------------------------------------------------------- */

import { audit } from './audit';

export type Role = 'engineer' | 'auditor' | 'admin';

export interface User {
  email: string;
  name: string;
  role: Role;
  title: string;
  demo: boolean;
}

export interface DemoAccount extends User {
  password: string;
}

export const DEMO_PASSWORD = 'Kavach@2026';

export const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    email: 'engineer@kavach.local', password: DEMO_PASSWORD, demo: true,
    name: 'A. Sharma', role: 'engineer', title: 'Inspection engineer',
  },
  {
    email: 'auditor@kavach.local', password: DEMO_PASSWORD, demo: true,
    name: 'R. Nayak', role: 'auditor', title: 'Compliance auditor',
  },
  {
    email: 'admin@kavach.local', password: DEMO_PASSWORD, demo: true,
    name: 'S. Rao', role: 'admin', title: 'Node administrator',
  },
];

/** Kept for the documented single-account credential in the brief. */
export const PRIMARY_DEMO = { email: 'demo@kavach.local', password: DEMO_PASSWORD };

const SESSION_KEY = 'kavach.session.v1';
const LOCAL_USERS_KEY = 'kavach.localUsers.v1';

export const ROLE_LABEL: Record<Role, string> = {
  engineer: 'Engineer',
  auditor: 'Auditor',
  admin: 'Administrator',
};

function safeRead<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function safeWrite(key: string, value: unknown): void {
  try { window.localStorage.setItem(key, JSON.stringify(value)); } catch { /* private mode: session is in memory only */ }
}

function safeRemove(key: string): void {
  try { window.localStorage.removeItem(key); } catch { /* nothing to do */ }
}

export class AuthError extends Error {}

class AuthService {
  private user: User | null = null;
  private restored = false;
  private listeners = new Set<() => void>();

  /** Called once from main.tsx before React mounts. */
  restore(): void {
    if (this.restored) return;
    this.restored = true;
    if (typeof window === 'undefined') return;
    const saved = safeRead<User | null>(SESSION_KEY, null);
    if (saved && saved.email) {
      this.user = saved;
      audit.record('session', 'Session restored on the on-premise node', `${saved.email} · role: ${ROLE_LABEL[saved.role]} · demonstration sign-in`);
      this.emit();
    }
  }

  private emit(): void { this.listeners.forEach((f) => f()); }

  subscribe = (f: () => void): (() => void) => { this.listeners.add(f); return () => { this.listeners.delete(f); }; };
  getSnapshot = (): User | null => this.user;

  current(): User | null { return this.user; }
  isAuthenticated(): boolean { return this.user !== null; }

  /** Accounts created through the demo signup form, plus the built-ins. */
  private localUsers(): DemoAccount[] { return safeRead<DemoAccount[]>(LOCAL_USERS_KEY, []); }

  accounts(): DemoAccount[] { return [...DEMO_ACCOUNTS, ...this.localUsers()]; }

  login(email: string, password: string): User {
    const e = email.trim().toLowerCase();
    if (!e) throw new AuthError('Enter an email address.');
    if (!password) throw new AuthError('Enter the password.');

    // demo@kavach.local is an alias for the engineer account.
    const lookup = e === PRIMARY_DEMO.email ? DEMO_ACCOUNTS[0]!.email : e;
    const found = this.accounts().find((a) => a.email === lookup);

    if (!found) throw new AuthError('No account on this node matches that email. Use one of the demo accounts listed beside the form.');
    if (found.password !== password) throw new AuthError('That password does not match. Every demo account uses Kavach@2026.');

    const { password: _pw, ...user } = found;
    void _pw;
    this.user = user;
    safeWrite(SESSION_KEY, user);
    audit.record('session', 'Session opened on the on-premise node', `${user.email} · role: ${ROLE_LABEL[user.role]} · demonstration sign-in`);
    this.emit();
    return user;
  }

  signup(input: { name: string; email: string; password: string; role: Role }): User {
    const email = input.email.trim().toLowerCase();
    const name = input.name.trim();
    if (!name) throw new AuthError('Enter a name.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AuthError('That does not look like an email address.');
    if (input.password.length < 8) throw new AuthError('Use at least 8 characters for the password.');
    if (this.accounts().some((a) => a.email === email)) throw new AuthError('An account with that email already exists on this node.');

    const account: DemoAccount = {
      email, name, password: input.password, role: input.role,
      title: ROLE_LABEL[input.role], demo: true,
    };
    safeWrite(LOCAL_USERS_KEY, [...this.localUsers(), account]);
    audit.record('session', 'Local demonstration account created', `${email} · role: ${ROLE_LABEL[input.role]}`);
    return this.login(email, input.password);
  }

  logout(): void {
    const who = this.user?.email ?? 'unknown';
    this.user = null;
    safeRemove(SESSION_KEY);
    audit.record('session', 'Session closed', `${who} · workspace state discarded from this browser`);
    this.emit();
  }
}

export const auth = new AuthService();
