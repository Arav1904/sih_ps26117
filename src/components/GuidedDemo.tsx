/* ---------------------------------------------------------------
   Guided demo.

   Eight stops on the golden path, roughly four minutes. It navigates
   for the visitor and says in one line what to look at. It does not
   dim the screen, grab focus or block anything — a judge can leave it
   running and still click wherever they like.
   --------------------------------------------------------------- */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { store, useApp } from '../state/store';
import { Close, ArrowRight } from './icons';

export interface DemoStop { to: string; title: string; hint: string; run?: 'inspection' | 'code' }

export const DEMO_SCRIPT: DemoStop[] = [
  { to: '/app', title: 'Start here', hint: 'The workbench home. Ask for anything, or pick a job below the box.' },
  { to: '/app/run', title: 'Watch the agent work', hint: 'Press Start, then watch the seven stages fill in one at a time.', run: 'inspection' },
  { to: '/app/documents', title: 'What the models actually read', hint: 'Page 8 scored too low to trust, so it is held rather than guessed at.' },
  { to: '/app/knowledge', title: 'Where the answers came from', hint: 'Every finding is bound to a real clause in your own procedures.' },
  { to: '/app/sandbox', title: 'Code, proved rather than promised', hint: 'Two of seven tests pass, then the fix lands and all seven do.', run: 'code' },
  { to: '/app/routing', title: 'How it picks the right AI', hint: 'Five kinds of input, five different local models. Nobody chooses by hand.' },
  { to: '/app/sovereignty', title: 'Proof nothing left the building', hint: 'Press the button and watch a real call to a public AI endpoint be refused.' },
  { to: '/app/audit', title: 'The record', hint: 'Everything you just watched, in order, exportable as a spreadsheet.' },
];

export function GuidedDemo() {
  const { guided } = useApp();
  const navigate = useNavigate();
  const stop = guided === null ? null : DEMO_SCRIPT[guided];

  useEffect(() => {
    if (!stop) return;
    navigate(stop.to);
    if (stop.run) store.start(stop.run);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guided]);

  if (!stop || guided === null) return null;

  return (
    <div className="demo-bar" role="region" aria-label="Guided demo">
      <div className="step">
        <b>{stop.title}</b>
        <span>{stop.hint}</span>
      </div>
      <span className="count">{guided + 1} / {DEMO_SCRIPT.length}</span>
      <button type="button" className="btn onblack sm" onClick={() => store.guidedBack()} disabled={guided === 0}>Back</button>
      <button type="button" className="btn solid sm" onClick={() => store.guidedNext(DEMO_SCRIPT.length)}>
        {guided === DEMO_SCRIPT.length - 1 ? 'Finish' : 'Next'} <ArrowRight size={14} />
      </button>
      <button type="button" className="btn onblack sm" onClick={() => store.stopGuided()} aria-label="End guided demo"><Close size={14} /></button>
    </div>
  );
}
