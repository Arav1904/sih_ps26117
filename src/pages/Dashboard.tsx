import { Link, useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { AskKavach } from '../components/AskKavach';
import { Panel, Row, Button, Badge, Empty, Meter, SimNote, Dot } from '../components/ui';
import { WorkflowSpine, Sparkline } from '../components/diagrams';
import { Doc, Image, Code, Search, Play, ArrowRight } from '../components/icons';
import { useAuth } from '../state/useAuth';
import { store, useApp } from '../state/store';
import { useEgress } from '../state/useEgress';
import { useAudit } from '../state/useAudit';
import { MODELS, KNOWLEDGE } from '../data/corpus';
import { SCENARIOS } from '../data/scenarios';
import { hourly } from '../data/telemetry';
import { knowledge } from '../services/knowledge';
import { ocr } from '../services/ocr';
import { seconds } from '../lib/format';
import type { ScenarioKey } from '../types';

const QUICK: { t: string; d: string; icon: typeof Doc; scenario: ScenarioKey; to: string }[] = [
  { t: 'Review an inspection report', d: 'Read the scans, find every issue, check each one against procedure, draft the approval note.', icon: Doc, scenario: 'inspection', to: '/app/run' },
  { t: 'Analyse a drawing', d: 'Read a P&ID sheet including anything written on it by hand, and cross-check it against the register.', icon: Image, scenario: 'inspection', to: '/app/documents' },
  { t: 'Fix a calculation', d: 'Find the fault in a Python module, patch it, and prove the patch by running the tests.', icon: Code, scenario: 'code', to: '/app/sandbox' },
  { t: 'Search internal procedures', d: 'Ask in plain words and get the document, clause and page the answer came from.', icon: Search, scenario: 'inspection', to: '/app/knowledge' },
];

function greeting(): string {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export default function Dashboard() {
  const user = useAuth();
  const app = useApp();
  const blocked = useEgress();
  const events = useAudit();
  const navigate = useNavigate();

  const loaded = MODELS.filter((m) => m.state === 'loaded');
  const held = ocr.belowThreshold();
  const run = app.run;
  const running = !!run && run.finishedAt === null;
  const settled = run ? run.stepStates.filter((s) => s !== 'pending').length : 0;
  const total = run ? SCENARIOS[run.scenario].steps.length : 0;

  function launch(scenario: ScenarioKey, to: string) {
    store.start(scenario);
    navigate(to);
  }

  return (
    <Shell>
      <div className="container">
        <header className="page-head">
          <div className="eyebrow">
            <Dot tone="ok" live /> Local node MRPL-GPU-01 · {user?.title ?? 'Signed in'}
          </div>
          <h1>{greeting()}, {user?.name.split(' ').slice(-1)[0] ?? 'Engineer'}.</h1>
          <p className="lede">What would you like to work on?</p>
        </header>
      </div>

      <div className="container">
        <AskKavach autoFocus />
      </div>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            {QUICK.map((q) => (
              <button key={q.t} type="button" className="task-card" onClick={() => launch(q.scenario, q.to)}>
                <span className="tc-icon"><q.icon size={19} /></span>
                <h3>{q.t}</h3>
                <p>{q.d}</p>
                <span className="tc-meta">Start now <ArrowRight size={12} style={{ display: 'inline', verticalAlign: -2 }} /></span>
              </button>
            ))}
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="status-strip">
            <span className="si"><Dot tone="ok" live /> <b>Local only</b></span>
            <span className="si"><Dot tone="ok" /> Connected to the local node</span>
            <span className="si"><Dot tone="accent" /> Internet egress blocked · <b>{blocked.length} refused</b></span>
            <span className="si"><Dot tone="ok" /> <b>{loaded.length}</b> models loaded, {MODELS.length - loaded.length} on standby</span>
            <span className="si"><Dot tone="ok" /> Knowledge base indexed · <b>{knowledge.passages().toLocaleString('en-IN')}</b> passages</span>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid wide-first">
            <Panel
              title={running ? 'Running now' : run ? 'Last run' : 'Active work'}
              note={running ? 'You can leave this page — the run keeps going.' : run ? 'Finished. The deliverables are on the agent-run screen.' : 'Nothing is running. Pick a job above, or ask for one in the box.'}
              action={run ? <Link to={run.scenario === 'code' ? '/app/sandbox' : '/app/run'} className="btn ghost sm">Open</Link> : null}
            >
              {run ? (
                <>
                  <Row
                    label={<b>{run.label}</b>}
                    sub={SCENARIOS[run.scenario].prompt}
                    value={running ? `${settled}/${total}` : seconds((run.finishedAt ?? Date.now()) - run.startedAt)}
                  />
                  <div style={{ margin: '16px 0 8px' }}>
                    <Meter value={total ? settled / total : 0} label="run progress" thick />
                  </div>
                  <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 14 }}>
                    <Badge tone={running ? 'accent' : 'ok'}>{running ? 'Working' : 'Complete'}</Badge>
                    {app.artifacts.filter((a) => a.runId === run.id).map((a) => <Badge key={a.id}>{a.name}</Badge>)}
                  </div>
                </>
              ) : (
                <Empty title="No active task" action={<Button variant="solid" onClick={() => launch('inspection', '/app/run')}><Play size={14} /> Start the inspection review</Button>}>
                  When a job is running, its progress appears here and on the agent-run screen.
                </Empty>
              )}

              <div style={{ marginTop: 26 }}>
                <div className="eyebrow" style={{ marginBottom: 12 }}>How KAVACH handles any job</div>
                <WorkflowSpine
                  active={running ? SCENARIOS[run!.scenario].steps[Math.max(0, run!.stepStates.indexOf('active'))]?.stage : undefined}
                  showPlain={false}
                />
              </div>
            </Panel>

            <div className="stack">
              <Panel title="Recent work" note={app.history.length ? `${app.history.length} run${app.history.length === 1 ? '' : 's'} this session.` : 'Runs from this session appear here.'}>
                {app.history.length === 0 ? (
                  <Empty title="Nothing yet">Start a job and it will be listed here with what it produced.</Empty>
                ) : (
                  app.history.slice(0, 5).map((h) => (
                    <Row
                      key={h.id}
                      label={<b>{h.label}</b>}
                      sub={`${h.artifacts.length} file${h.artifacts.length === 1 ? '' : 's'} produced`}
                      value={seconds((h.finishedAt ?? Date.now()) - h.startedAt)}
                    />
                  ))
                )}
              </Panel>

              <Panel title="Waiting on you" note="KAVACH does not guess when it is unsure. These are the things it held back.">
                {held.length === 0 ? (
                  <Empty title="Nothing held">Everything the models read scored above the release threshold.</Empty>
                ) : (
                  held.map((p) => (
                    <Row key={p.page} label={<b>Page {p.page} needs a human read</b>} sub={`transcribed at ${p.confidence.toFixed(2)}, below the 0.85 threshold — excluded from the approval note`} value={<Link to="/app/documents" className="linkish">Review</Link>} />
                  ))
                )}
              </Panel>

              <Panel title="Node activity" note={`${events.length} events recorded this session · ${KNOWLEDGE.filter((k) => k.indexed).length} of ${KNOWLEDGE.length} documents indexed.`}>
                <Sparkline values={hourly()} label="Tasks routed per hour over the last 24 hours" />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                  <span className="mono u-dim" style={{ fontSize: 11 }}>24h ago</span>
                  <SimNote />
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel variant="dark" title="New here?" note="An eight-stop walkthrough of the golden path — document in, verified deliverable out, then the proof that nothing left the building.">
            <div className="btn-row">
              <Button variant="solid" onClick={() => store.startGuided()}><Play size={15} /> Run the guided demo</Button>
              <Link to="/app/sovereignty" className="btn onblack">Skip to the data boundary</Link>
            </div>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
