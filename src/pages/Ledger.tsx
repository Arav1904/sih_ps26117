import { useMemo, useState } from 'react';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Button, Tabs, Empty, Badge, toast } from '../components/ui';
import { Donut } from '../components/diagrams';
import { audit } from '../services/audit';
import { useAudit } from '../state/useAudit';
import { useEgress } from '../state/useEgress';
import { knowledge } from '../services/knowledge';
import { buildXlsx } from '../lib/ooxml';
import { clock, seq } from '../lib/format';
import { Download, Search } from '../components/icons';
import type { AuditClass } from '../types';
import { useApp } from '../state/store';

const CLASSES: { key: AuditClass | 'all'; label: string }[] = [
  { key: 'all', label: 'Everything' },
  { key: 'session', label: 'Session' },
  { key: 'task', label: 'Task' },
  { key: 'agent', label: 'Agent step' },
  { key: 'security', label: 'Security' },
  { key: 'artifact', label: 'File' },
];

const PLAIN: Record<AuditClass, string> = {
  session: 'Someone signed in, signed out or changed the mode',
  task: 'A job was accepted, stopped or finished',
  agent: 'KAVACH carried out one step of a job',
  security: 'Something tried to leave the machine and was refused',
  artifact: 'A file was written or exported',
};

export default function Ledger() {
  const events = useAudit();
  const blocked = useEgress();
  const app = useApp();
  const [view, setView] = useState<'summary' | 'log'>('summary');
  const [filter, setFilter] = useState<AuditClass | 'all'>('all');
  const [query, setQuery] = useState('');

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events
      .filter((e) => filter === 'all' || e.cls === filter)
      .filter((e) => !q || e.message.toLowerCase().includes(q) || e.detail.toLowerCase().includes(q));
  }, [events, filter, query]);

  const counts = CLASSES.slice(1).map((c) => ({
    label: c.label.toLowerCase(),
    value: events.filter((e) => e.cls === c.key).length,
  }));

  function exportLedger() {
    try {
      const rows: (string | number)[][] = [
        ['Seq', 'Time', 'Class', 'Event', 'Detail'],
        ...events.map((e) => [e.seq, clock(e.at), e.cls, e.message, e.detail]),
      ];
      const bytes = buildXlsx(rows, 'Audit');
      const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
      const el = document.createElement('a');
      el.href = url;
      el.download = 'KAVACH_Audit_Ledger.xlsx';
      document.body.appendChild(el);
      el.click();
      el.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 4000);
      audit.record('artifact', 'Audit ledger exported to local disk', 'KAVACH_Audit_Ledger.xlsx');
      toast('Ledger exported', 'KAVACH_Audit_Ledger.xlsx');
    } catch {
      toast('Could not write the file', 'Your browser blocked the download.');
    }
  }

  const lastRun = app.history[0];

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Audit"
          title="Everything that happened, in order."
          lede="This is what an auditor reads six months later when they want to know why a note said what it said. Every line has a sequence number that is never reused, and nothing can be edited after the fact."
          ps="audit logging of every action"
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 30 }}>
            <Stat value={events.length} label="events recorded this session" boxed />
            <Stat value={blocked.length} label="security events — all of them refusals" accent boxed />
            <Stat value={knowledge.passages().toLocaleString('en-IN')} label="passages available for grounding" boxed />
          </div>

          <Tabs
            label="Ledger view"
            value={view}
            onChange={setView}
            tabs={[{ key: 'summary', label: 'Summary' }, { key: 'log', label: 'Technical log' }]}
          />

          {view === 'summary' ? (
            <div className="grid two">
              <Panel title="What happened in this session" note="The plain-language answer, before any log line.">
                <Row n="01" label={<b>Who did it</b>} sub={`${events.filter((e) => e.cls === 'session').length} session events — sign-in, mode changes and sign-out`} value="session" />
                <Row n="02" label={<b>What was asked for</b>} sub={lastRun ? `${lastRun.label} — ${lastRun.artifacts.length} file${lastRun.artifacts.length === 1 ? '' : 's'} produced` : 'No job has been run in this session yet'} value="task" />
                <Row n="03" label={<b>Which files were used</b>} sub={app.inputs.length ? app.inputs.map((f) => f.name).join(', ') : 'none attached yet'} value="input" />
                <Row n="04" label={<b>Which AI was used</b>} sub={`${events.filter((e) => e.cls === 'agent').length} agent steps across the local models on this node`} value="agent" />
                <Row n="05" label={<b>What was produced</b>} sub={app.artifacts.length ? app.artifacts.map((a) => a.name).join(', ') : 'nothing yet'} value="file" />
                <Row n="06" label={<b>What was held for review</b>} sub={app.artifacts.some((a) => a.verification === 'flagged') ? 'one deliverable is flagged — a page could not be read well enough to use' : 'nothing held'} value={app.artifacts.some((a) => a.verification === 'flagged') ? <Badge tone="hold">1 flagged</Badge> : <Badge tone="ok">none</Badge>} />
                <Row n="07" label={<b>Did anything try to leave the machine</b>} sub={blocked.length ? `${blocked.length} attempt${blocked.length === 1 ? '' : 's'}, all refused — see the data boundary screen` : 'no outbound call has been attempted'} value={<Badge tone={blocked.length ? 'hold' : 'ok'}>0 permitted</Badge>} />
              </Panel>

              <Panel title="What the session is made of" note="Agent steps dominate a healthy session. A security line is only ever a refusal — there is no permitted-egress category for it to fall into.">
                {events.length === 0 ? (
                  <Empty title="No events yet">Run a job and this fills in immediately.</Empty>
                ) : (
                  <Donut
                    slices={counts.filter((c) => c.value > 0).map((c, i) => ({ label: c.label, value: c.value, tone: i === 0 ? 'accent' : i === 1 ? 'ink' : 'muted' }))}
                    centerValue={events.length}
                    centerLabel="events"
                    caption="Ledger events by class"
                  />
                )}
                <div style={{ marginTop: 20 }}>
                  {(Object.keys(PLAIN) as AuditClass[]).map((k) => (
                    <Row key={k} label={<b>{CLASSES.find((c) => c.key === k)!.label}</b>} sub={PLAIN[k]} value={events.filter((e) => e.cls === k).length} />
                  ))}
                </div>
              </Panel>
            </div>
          ) : (
            <Panel
              title="The record"
              note={`${shown.length} of ${events.length} events shown, newest first. Run a job on another screen and new lines appear here immediately.`}
              action={<Button onClick={exportLedger}><Download size={14} /> Export as a spreadsheet</Button>}
            >
              <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', marginBottom: 'var(--s-4)' }}>
                <span style={{ position: 'relative', flex: 1, minWidth: 220 }}>
                  <span className="sr-only" id="ledger-search">Search the ledger</span>
                  <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search events" style={{ paddingLeft: 38 }} aria-labelledby="ledger-search" />
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-muted-2)' }}><Search size={16} /></span>
                </span>
              </div>
              <div className="chip-row" style={{ marginBottom: 'var(--s-4)' }}>
                {CLASSES.map((c) => (
                  <button key={c.key} type="button" className={filter === c.key ? 'chip on' : 'chip'} aria-pressed={filter === c.key} onClick={() => setFilter(c.key)}>
                    {c.label}
                  </button>
                ))}
              </div>
              <div className="scroll-y">
                {shown.length === 0 ? (
                  <Empty title="Nothing matches that">Clear the search, or start a job on another screen.</Empty>
                ) : (
                  shown.map((e) => (
                    <Row key={e.seq} n={seq(e.seq)} label={<b>{e.message}</b>} sub={e.detail} value={`${e.cls} · ${clock(e.at)}`} />
                  ))
                )}
              </div>
            </Panel>
          )}
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel title="Grounding behind the last run" note="Each finding the agent released is bound to the clause it was checked against. That pairing is what makes the note reviewable rather than merely plausible.">
            {knowledge.citations().map((f) => (
              <Row key={f.ref} n={f.ref.slice(2)} label={<b>{f.clause}</b>} sub={`${f.tag} — ${f.action}`} value={`p.${f.page}`} />
            ))}
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
