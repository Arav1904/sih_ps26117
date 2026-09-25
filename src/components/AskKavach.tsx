/* ---------------------------------------------------------------
   Ask KAVACH — the command centre.

   Conversational to use, but not a chat transcript. One request goes
   in; a task card comes out with a plan attached and a button that
   actually starts the work. The design brief for this was: Claude-
   style ease of interaction, enterprise workflow instrumentation,
   agent execution timeline — without becoming a generic chatbot.
   --------------------------------------------------------------- */
import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { classify } from '../lib/classify';
import { audit } from '../services/audit';
import { store } from '../state/store';
import { SCENARIOS } from '../data/scenarios';
import { Button, SimNote } from './ui';
import { ArrowRight, Sparkle } from './icons';
import type { ScenarioKey } from '../types';

export const SUGGESTIONS = [
  { text: 'Review an inspection report and draft the approval note', scenario: 'inspection' as ScenarioKey },
  { text: 'Read the mark-up on a P&ID drawing', scenario: 'inspection' as ScenarioKey },
  { text: 'Fix this Python flow calculation and prove it works', scenario: 'code' as ScenarioKey },
  { text: 'Find the procedure that covers a thickness reading', scenario: 'inspection' as ScenarioKey },
];

/** Which demonstration run a free-text request maps onto. */
export function scenarioFor(text: string): ScenarioKey {
  return classify(text).key === 'code' ? 'code' : 'inspection';
}

export function AskKavach({
  autoFocus, compact, placeholder = 'Review this inspection report and prepare an approval note',
}: { autoFocus?: boolean; compact?: boolean; placeholder?: string }) {
  const [text, setText] = useState('');
  const [plan, setPlan] = useState<{ q: string; scenario: ScenarioKey; label: string; model: string; reason: string } | null>(null);
  const navigate = useNavigate();

  function submit(e: FormEvent) {
    e.preventDefault();
    const q = text.trim();
    if (!q) return;
    const c = classify(q);
    const scenario = scenarioFor(q);
    audit.record('task', 'Request received from the command bar', `${c.label} → ${c.modelName}`);
    setPlan({ q, scenario, label: c.label, model: c.modelName, reason: c.reason });
    setText('');
  }

  function run() {
    if (!plan) return;
    store.start(plan.scenario);
    navigate(plan.scenario === 'code' ? '/app/sandbox' : '/app/run');
  }

  const sc = plan ? SCENARIOS[plan.scenario] : null;

  return (
    <div>
      <form className="ask" onSubmit={submit}>
        <div className="ask-label"><Sparkle size={13} /> Ask KAVACH</div>
        <div className="ask-field">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) submit(e); }}
            placeholder={placeholder}
            aria-label="What would you like KAVACH to do?"
            rows={compact ? 1 : 2}
            autoFocus={autoFocus}
          />
          <Button type="submit" variant="solid" disabled={!text.trim()}>
            Plan it <ArrowRight size={15} />
          </Button>
        </div>
        {!plan ? (
          <div className="chip-row" style={{ marginTop: 'var(--s-4)' }}>
            {SUGGESTIONS.map((s) => (
              <button key={s.text} type="button" className="chip" onClick={() => setText(s.text)}>
                {s.text}
              </button>
            ))}
          </div>
        ) : null}
        <div className="ask-foot">
          <span className="ask-hint">Press Enter to send. Nothing you type leaves this machine.</span>
          <span style={{ marginLeft: 'auto' }}><SimNote /></span>
        </div>
      </form>

      {plan && sc ? (
        <div className="ask-reply" role="status">
          <div className="who">KAVACH</div>
          <p style={{ marginBottom: 10 }}>
            I read that as <b>{plan.label.toLowerCase()}</b>, so I will use <b>{plan.model}</b> — {plan.reason}.
            I will handle it in {sc.steps.length} steps.
          </p>
          <ol style={{ margin: '0 0 12px', paddingLeft: 0 }}>
            {sc.steps.slice(0, 5).map((s, i) => (
              <li key={s.title} style={{ display: 'flex', gap: 10, fontSize: 13, padding: '3px 0', color: 'var(--color-muted)' }}>
                <span className="mono" style={{ color: 'var(--color-burgundy)' }}>{String(i + 1).padStart(2, '0')}</span>
                {s.title}
              </li>
            ))}
            {sc.steps.length > 5 ? (
              <li style={{ fontSize: 13, color: 'var(--color-muted-2)', paddingLeft: 26 }}>
                and {sc.steps.length - 5} more, including checking its own work before handing anything over
              </li>
            ) : null}
          </ol>
          <div className="btn-row">
            <Button variant="solid" onClick={run}>Run with KAVACH <ArrowRight size={15} /></Button>
            <Button variant="ghost" onClick={() => setPlan(null)}>Not that — ask again</Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
