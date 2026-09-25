/* ---------------------------------------------------------------
   The agent timeline — the centrepiece of the prototype.

   A judge should be able to watch this and narrate what is happening
   without knowing a single AI term. Each step shows: a plain title,
   which local tool it used, its state, and — one click down — why
   that step exists and what the tool actually returned.

   Steps are grouped under the seven stages of the workflow spine,
   so the shape of the run is legible before any detail is read.
   --------------------------------------------------------------- */
import { useState } from 'react';
import type { AgentStep, StageKey, StepState } from '../types';
import { STAGES } from '../data/stages';
import { Check, ArrowRight, TOOL_ICONS, Bolt } from './icons';
import { seconds } from '../lib/format';

function stateLabel(s: StepState, step: AgentStep): string {
  if (s === 'attention') return 'needs a human';
  if (s === 'active') return 'working…';
  if (s === 'done') return seconds(step.durationMs);
  return 'queued';
}

export function AgentTimeline({
  steps, states, openIndex, onToggle,
}: {
  steps: AgentStep[];
  states: StepState[];
  openIndex?: number | null;
  onToggle?: (i: number | null) => void;
}) {
  const [localOpen, setLocalOpen] = useState<number | null>(null);
  const open = openIndex !== undefined ? openIndex : localOpen;
  const toggle = onToggle ?? setLocalOpen;

  const settled = states.filter((s) => s === 'done' || s === 'attention').length;
  const fillPct = steps.length ? (settled / steps.length) * 100 : 0;

  /* group consecutive steps by stage, preserving order */
  const groups: { stage: StageKey; items: { step: AgentStep; i: number }[] }[] = [];
  steps.forEach((step, i) => {
    const last = groups[groups.length - 1];
    if (last && last.stage === step.stage) last.items.push({ step, i });
    else groups.push({ stage: step.stage, items: [{ step, i }] });
  });

  return (
    <div className="timeline">
      <span className="tl-fill" style={{ height: `calc(${fillPct}% - 20px)` }} aria-hidden="true" />
      {groups.map((g) => {
        const stage = STAGES.find((s) => s.key === g.stage)!;
        const reached = g.items.some(({ i }) => states[i] !== 'pending');
        return (
          <div key={`${g.stage}-${g.items[0]!.i}`}>
            <div className={reached ? 'tl-stage reached' : 'tl-stage'}>
              {stage.label}
              <span aria-hidden="true" style={{ opacity: .5 }}>·</span>
              <span style={{ textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-body)' }}>{stage.plain}</span>
            </div>
            {g.items.map(({ step, i }) => {
              const st = states[i] ?? 'pending';
              const Icon = TOOL_ICONS[step.tool] ?? Bolt;
              const isOpen = open === i;
              return (
                <div key={step.title} className={`tl-step ${st}`}>
                  <span className="marker" aria-hidden="true">
                    {st === 'done' ? <Check size={9} color="#fff" style={{ stroke: '#fff' }} /> : null}
                    {st === 'attention' ? <span style={{ width: 4, height: 4, background: '#fff', borderRadius: '50%' }} /> : null}
                  </span>
                  <button
                    type="button"
                    className="tl-head"
                    onClick={() => toggle(isOpen ? null : i)}
                    aria-expanded={isOpen}
                  >
                    <span style={{ color: 'var(--color-muted-2)', display: 'inline-flex', flexShrink: 0 }} aria-hidden="true">
                      <Icon size={15} />
                    </span>
                    <span className="tl-title">{step.title}</span>
                    <span className="tl-tool">{step.tool}</span>
                    <span className="tl-state">{stateLabel(st, step)}</span>
                  </button>
                  {isOpen ? (
                    <div className="tl-detail">
                      <p className="why"><b>Why this step? </b>{step.why}</p>
                      <div className="raw">{step.detail}</div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        );
      })}

      <div className="tl-stage reached" style={{ marginTop: 20 }}>
        Audit
        <span aria-hidden="true" style={{ opacity: .5 }}>·</span>
        <span style={{ textTransform: 'none', letterSpacing: 0, fontFamily: 'var(--font-body)' }}>
          every step above was written to the ledger as it happened
        </span>
        <ArrowRight size={13} />
      </div>
    </div>
  );
}
