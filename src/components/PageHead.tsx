import type { ReactNode } from 'react';
import { Badge } from './ui';

/** Every workbench screen opens the same way: an eyebrow that names
 *  the problem-statement line it answers, a plain title, one sentence
 *  a non-specialist can read, then the screen. */
export function PageHead({
  eyebrow, title, lede, ps, action,
}: { eyebrow?: ReactNode; title: string; lede: ReactNode; ps?: string; action?: ReactNode }) {
  return (
    <header className="page-head">
      {eyebrow ? <div className="eyebrow">{eyebrow}</div> : null}
      <h1>{title}</h1>
      <p className="lede">{lede}</p>
      {ps ? (
        <div className="head-end">
          <Badge tone="accent" className="plain">Problem statement · {ps}</Badge>
        </div>
      ) : null}
      {action ? <div className="head-end btn-row">{action}</div> : null}
    </header>
  );
}
