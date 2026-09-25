/* ---------------------------------------------------------------
   Navigation.

   Simple at the top level, deep inside the pages. Each authenticated
   entry names the line of the problem statement's expected solution
   it answers, so a judge can map screen → requirement without being
   told. Nothing is listed that the PS does not ask for.
   --------------------------------------------------------------- */
import type { ReactNode } from 'react';
import { Home, Bolt, Doc, Search, Cpu, Lock, Ledger, Moon, Terminal, Folder } from '../components/icons';
import type { Role } from '../services/auth';

export interface NavItem {
  to: string;
  label: string;
  /** the plain-language job of the screen, shown in the mobile drawer */
  blurb: string;
  /** the PS line this screen answers — shown on the screen itself */
  ps?: string;
  icon: (p: { size?: number }) => ReactNode;
  end?: boolean;
  /** roles that see it in the primary bar; undefined = everyone */
  roles?: Role[];
  group: 'work' | 'evidence' | 'system';
}

export const PUBLIC_NAV = [
  { to: '/how-it-works', label: 'How it works' },
  { to: '/capabilities', label: 'Capabilities' },
  { to: '/security', label: 'Security' },
];

export const APP_NAV: NavItem[] = [
  { to: '/app', label: 'Home', blurb: 'start a task, see what is running', icon: Home, end: true, group: 'work' },
  { to: '/app/run', label: 'Agent run', blurb: 'watch a job carried end to end', ps: 'an agentic task carried end to end, ending in a Word deliverable', icon: Bolt, group: 'work' },
  { to: '/app/documents', label: 'Documents', blurb: 'scans, drawings and what the models read', ps: 'a multimodal task involving image or scanned-document understanding', icon: Doc, group: 'work' },
  { to: '/app/knowledge', label: 'Knowledge', blurb: 'the procedures answers are grounded in', ps: 'grounded retrieval from an on-premise corpus', icon: Search, group: 'work' },
  { to: '/app/sandbox', label: 'Sandbox', blurb: 'code written, run and verified', ps: 'a coding task run and verified in a sandbox', icon: Terminal, group: 'work' },
  { to: '/app/routing', label: 'Model routing', blurb: 'which AI takes which job, and why', ps: 'model auto-selection across at least two different task types', icon: Cpu, group: 'evidence' },
  { to: '/app/sovereignty', label: 'Data boundary', blurb: 'proof that nothing left the building', ps: 'show through logs or a visible network monitor that no external calls are made', icon: Lock, group: 'evidence' },
  { to: '/app/audit', label: 'Audit', blurb: 'everything that happened, in order', ps: 'audit logging of every action', icon: Ledger, group: 'evidence' },
  { to: '/app/archive', label: 'Archive', blurb: 'the source documents, page by page', icon: Folder, group: 'evidence' },
  { to: '/app/night', label: 'Night Ops', blurb: 'the node after hours', icon: Moon, group: 'system' },
  { to: '/app/system', label: 'System', blurb: 'node, models and run mode', icon: Cpu, group: 'system', roles: ['admin', 'auditor', 'engineer'] },
];

/** The five that fit in the desktop bar. The rest live in the drawer. */
export const PRIMARY_APP_NAV = ['/app', '/app/run', '/app/documents', '/app/knowledge', '/app/sovereignty', '/app/audit'];

export const GROUP_LABEL: Record<NavItem['group'], string> = {
  work: 'Work',
  evidence: 'Evidence',
  system: 'System',
};
