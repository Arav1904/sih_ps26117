import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { AgentTimeline } from '../components/AgentTimeline';
import { WorkflowSpine } from '../components/diagrams';
import { Panel, Row, Stat, Button, Badge, Conf, Meter, Disclosure, Empty, SimNote, Callout, toast } from '../components/ui';
import { Gantt } from '../components/charts';
import { SCENARIOS } from '../data/scenarios';
import { FINDINGS } from '../data/corpus';
import { store, useApp } from '../state/store';
import { downloadArtifact } from '../services/artifact';
import { ocr, OCR_THRESHOLD } from '../services/ocr';
import { agent } from '../services/agent';
import { seconds } from '../lib/format';
import { Play, Download, ArrowRight, Check, Alert } from '../components/icons';
import { useAuth } from '../state/useAuth';

const SC = SCENARIOS.inspection;

export default function AgentRun() {
  const app = useApp();
  const user = useAuth();
  const [open, setOpen] = useState<number | null>(null);

  const run = app.run && app.run.scenario === 'inspection' ? app.run : null;
  const running = agent.isRunning(run);
  const done = !!run && run.finishedAt !== null;
  const states = run ? run.stepStates : SC.steps.map(() => 'pending' as const);
  const settled = states.filter((s) => s !== 'pending').length;
  const artifacts = app.artifacts.filter((a) => a.runId === run?.id);
  const held = ocr.belowThreshold();
  const activeIdx = states.indexOf('active');
  const activeStage = activeIdx >= 0 ? SC.steps[activeIdx]!.stage : done ? 'audit' : undefined;
  const reached = SC.steps.filter((_, i) => states[i] !== 'pending').map((s) => s.stage);

  function download(id: string) {
    const a = artifacts.find((x) => x.id === id);
    if (!a) return;
    try {
      downloadArtifact(a);
      toast('Saved to your downloads', a.name);
    } catch {
      toast('Could not write the file', 'Your browser blocked the download. Try again, or use a different browser.');
    }
  }

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Agent run"
          title="Watch it do the whole job."
          lede="One request, carried the whole way: read a fourteen-page scanned inspection report, pull out every finding, check each one against the procedure that governs it, price the work, and write an approval note as a Word file. Where it is not confident, it stops and says so."
          ps="an agentic task carried end to end, ending in a Word deliverable"
        />
      </div>

      <section className="section first">
        <div className="container">
          <WorkflowSpine active={activeStage} reached={reached} showPlain={false} />
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid wide-first">
            <div className="stack">
              {/* --------------------- the conversation ------------------- */}
              <Panel>
                <div className="turn user">
                  <span className="who" aria-hidden="true">{(user?.name ?? 'You').slice(0, 1)}</span>
                  <div className="bubble">
                    <div className="name">{user?.name ?? 'You'}</div>
                    <div className="body">{SC.prompt}</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                      {SC.inputs.map((f) => <Badge key={f.name}>{f.name} · {f.size}</Badge>)}
                    </div>
                  </div>
                </div>

                <div className="turn kavach">
                  <span className="who" aria-hidden="true">K</span>
                  <div className="bubble">
                    <div className="name">KAVACH</div>
                    <div className="body">
                      I will handle this in {SC.steps.length} steps — read the files, work out what is being asked,
                      choose the right AI for each part, do the work, check my own answer, then hand you the files.
                      {running ? ' Working on it now.' : done ? ' Finished — the files are below.' : ' Press start when you are ready.'}
                    </div>
                    <div className="btn-row" style={{ marginTop: 16 }}>
                      {running ? (
                        <Button variant="ghost" onClick={() => store.cancel()}>Stop the run</Button>
                      ) : (
                        <Button variant="solid" onClick={() => store.start('inspection')}>
                          <Play size={15} /> {done ? 'Run it again' : 'Run with KAVACH'}
                        </Button>
                      )}
                      {done ? <Link to="/app/audit" className="btn ghost">See the record <ArrowRight size={14} /></Link> : null}
                    </div>
                    {run ? (
                      <div style={{ marginTop: 18 }}>
                        <Meter value={settled / SC.steps.length} label="run progress" thick />
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 12, color: 'var(--color-muted)' }}>
                          <span className="mono">{settled} of {SC.steps.length} steps</span>
                          <span className="mono">{seconds((run.finishedAt ?? Date.now()) - run.startedAt)}</span>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>
              </Panel>

              {/* ------------------------ the timeline -------------------- */}
              <Panel
                title="What it is doing"
                note="Select any step to see why it exists and what the tool returned."
                action={<SimNote />}
              >
                <AgentTimeline steps={SC.steps} states={states} openIndex={open} onToggle={setOpen} />
                <Disclosure summary="Technical details — timing breakdown and raw tool log">
                  <div className="chart-scroll">
                    <Gantt
                      steps={SC.steps.map((s, i) => ({ title: s.title, tool: s.tool, durationMs: s.durationMs, state: states[i]! }))}
                      title="Agent run timeline"
                    />
                  </div>
                  <pre className="code" style={{ marginTop: 16, whiteSpace: 'pre-wrap' }}>
                    {SC.steps.map((s, i) => `[${String(i + 1).padStart(2, '0')}] ${s.tool.padEnd(18)} ${s.durationMs}ms  ${states[i]}\n     ${s.detail.replace(/\n/g, '\n     ')}`).join('\n')}
                  </pre>
                </Disclosure>
              </Panel>
            </div>

            {/* -------------------------- side rail --------------------- */}
            <div className="stack">
              <Panel title="At a glance">
                <div className="grid three tight">
                  <Stat value={`${settled}/${SC.steps.length}`} label="steps done" accent />
                  <Stat value={run ? seconds((run.finishedAt ?? Date.now()) - run.startedAt) : '—'} label="elapsed" />
                  <Stat value={artifacts.length} label="files produced" />
                </div>
              </Panel>

              <Panel title="Your files" note="Read from a folder on this machine. Never copied off it.">
                {SC.inputs.map((f, i) => (
                  <Row key={f.name} n={String(i + 1).padStart(2, '0')} label={<b>{f.name}</b>} sub={f.meta} value={f.size} />
                ))}
              </Panel>

              <Panel
                title="Deliverables"
                note={artifacts.length ? 'Real files, generated on this machine with no library and no network. Open them in Word and Excel.' : 'Two files are written when the run completes.'}
              >
                {artifacts.length === 0 ? (
                  <Empty title="Nothing written yet">Start the run; the files appear here once the checking step clears.</Empty>
                ) : (
                  artifacts.map((a) => (
                    <Row
                      key={a.id}
                      label={<b>{a.name}</b>}
                      sub={`${a.note} · from ${a.sources}`}
                      value={<Button size="sm" onClick={() => download(a.id)}><Download size={13} /> Save</Button>}
                    />
                  ))
                )}
              </Panel>

              <Panel title="What it checked before handing anything over" note="Three checks passed. One did not — which is why the note is flagged rather than presented as finished.">
                <Row n="01" label={<b>Citations</b>} sub={`${FINDINGS.length} of ${FINDINGS.length} findings carry a clause you can look up`} value={<Badge tone="ok"><Check size={11} /> pass</Badge>} />
                <Row n="02" label={<b>Arithmetic</b>} sub="estimate totals recomputed independently of the model" value={<Badge tone="ok"><Check size={11} /> pass</Badge>} />
                <Row n="03" label={<b>Completeness</b>} sub="every finding it extracted appears in the note" value={<Badge tone="ok"><Check size={11} /> pass</Badge>} />
                <Row
                  n="04"
                  label={<b>Coverage</b>}
                  sub={`page ${held.map((p) => p.page).join(' and ')} could not be read well enough to use, and is named in the note`}
                  value={<Badge tone="hold"><Alert size={11} /> held</Badge>}
                />
                <div style={{ marginTop: 16 }}>
                  <Callout title="Why this matters">
                    A system that always says yes is not trustworthy. KAVACH shows the page it could not read at{' '}
                    <Conf value={Math.min(...held.map((p) => p.confidence))} threshold={OCR_THRESHOLD} /> so the
                    engineer signing knows exactly what they still have to check themselves.
                  </Callout>
                </div>
              </Panel>
            </div>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel
            title="What it found"
            note="Four findings, each tied to the clause it breaches. An answer without a retrievable clause is a recollection, not a citation."
            action={<Link to="/app/archive" className="btn ghost sm">Open the source report</Link>}
          >
            <div className="grid two">
              {FINDINGS.map((f) => (
                <div key={f.ref} style={{ border: '1px solid var(--color-border)', borderRadius: 'var(--r-sm)', padding: 'var(--s-4)', borderLeft: `3px solid ${f.severity === 'high' ? 'var(--color-burgundy)' : f.severity === 'medium' ? 'var(--color-border-strong)' : 'var(--color-border)'}` }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'baseline', marginBottom: 6 }}>
                    <b style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--color-burgundy)' }}>{f.ref}</b>
                    <b style={{ fontSize: 'var(--text-sm)' }}>{f.tag}</b>
                    <Badge tone={f.severity === 'high' ? 'hold' : 'plain'} className="plain">{f.severity}</Badge>
                    <span className="mono u-dim" style={{ marginLeft: 'auto', fontSize: 11 }}>p.{f.page}</span>
                  </div>
                  <p style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>{f.text}</p>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                    <b>{f.clause}</b> — {f.action}
                  </p>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
