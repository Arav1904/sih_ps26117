import type { Stage, StageKey } from '../types';

/* ---------------------------------------------------------------
   The workflow spine.

   INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT

   These seven words appear on the landing page, on the dashboard
   and above every agent run. They are the conceptual backbone of
   the product: learn them once, and every screen makes sense.
   Nothing here uses AI vocabulary.
   --------------------------------------------------------------- */

export const STAGES: Stage[] = [
  { key: 'input',      label: 'Input',      plain: 'Your files arrive on the machine in your building.' },
  { key: 'understand', label: 'Understand', plain: 'KAVACH works out what is actually being asked.' },
  { key: 'select',     label: 'Select',     plain: 'It picks the right local AI for that kind of work.' },
  { key: 'act',        label: 'Act',        plain: 'It does the job, one step at a time, showing each one.' },
  { key: 'verify',     label: 'Verify',     plain: 'It checks its own answer before showing it to you.' },
  { key: 'deliver',    label: 'Deliver',    plain: 'You get a real file back — not a chat reply to retype.' },
  { key: 'audit',      label: 'Audit',      plain: 'Every step is written down, in order, and kept.' },
];

export const STAGE_OF = (k: StageKey): Stage => STAGES.find((s) => s.key === k) ?? STAGES[0]!;

export const STAGE_INDEX = (k: StageKey): number => STAGES.findIndex((s) => s.key === k);
