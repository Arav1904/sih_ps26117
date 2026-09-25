import { useState } from 'react';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Button, Badge, Disclosure, Empty, Meter, CountUp, SimNote, toast } from '../components/ui';
import { AgentTimeline } from '../components/AgentTimeline';
import { WorkflowSpine } from '../components/diagrams';
import { SCENARIOS } from '../data/scenarios';
import { BROKEN_CODE, FIXED_CODE, TESTS, SANDBOX_LIMITS } from '../data/corpus';
import { store, useApp } from '../state/store';
import { downloadArtifact } from '../services/artifact';
import { seconds } from '../lib/format';
import { agent } from '../services/agent';
import { Play, Download, Check, Close } from '../components/icons';

const SC = SCENARIOS.code;
const passBefore = TESTS.filter((t) => t.before === 'pass').length;
const passAfter = TESTS.filter((t) => t.after === 'pass').length;

export default function Sandbox() {
  const app = useApp();
  const [view, setView] = useState<'before' | 'after'>('before');
  const run = app.run && app.run.scenario === 'code' ? app.run : null;
  const running = agent.isRunning(run);
  const done = !!run && run.finishedAt !== null;
  const states = run ? run.stepStates : SC.steps.map(() => 'pending' as const);
  const artifacts = app.artifacts.filter((a) => a.runId === run?.id);
  const showAfter = view === 'after';

  /* The patch lands at step 7; before that the suite is still at 2 of 7. */
  const patched = states.slice(7).some((s) => s !== 'pending');
  const passing = patched ? passAfter : passBefore;
  const settled = states.filter((s) => s !== 'pending').length;
  const activeIdx = states.indexOf('active');
  const activeStage = activeIdx >= 0 ? SC.steps[activeIdx]!.stage : done ? 'audit' : undefined;
  const reached = SC.steps.filter((_, i) => states[i] !== 'pending').map((s) => s.stage);

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Sandbox"
          title="Code, proved rather than promised."
          lede="An internal flow calculation is returning values about ten times too low. KAVACH reads it, runs the existing tests to see the failure for itself, finds the fault, checks the corrected formula against the published standard, patches it, and runs the tests again. Every execution happens in a container with no network attached."
          ps="a coding task run and verified in a sandbox"
        />
      </div>

      <section className="section first">
        <div className="container">
          <WorkflowSpine active={activeStage} reached={reached} showPlain={false} />
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Panel
            title="The test suite is the whole argument"
            note="The claim is not that the agent believes it is fixed. It is that the suite ran, in a sandbox, and the runner reported the result."
            action={
              <div className="btn-row">
                {running ? (
                  <Button variant="ghost" onClick={() => store.cancel()}>Stop the run</Button>
                ) : (
                  <Button variant="solid" onClick={() => store.start('code')}>
                    <Play size={15} /> {done ? 'Run it again' : 'Run it in the sandbox'}
                  </Button>
                )}
              </div>
            }
          >
            <div className="grid three" style={{ marginBottom: 24 }}>
              <Stat value={<><CountUp to={passing} /> / {TESTS.length}</>} label={patched ? 'tests passing after the fix' : 'tests passing right now'} accent />
              <Stat value={`${settled}/${SC.steps.length}`} label="steps done" />
              <Stat value={run ? seconds((run.finishedAt ?? Date.now()) - run.startedAt) : '—'} label="elapsed" />
            </div>

            <Meter value={passing / TESTS.length} label="tests passing" thick />

            <div style={{ marginTop: 20 }}>
              {TESTS.map((t) => {
                const ok = patched ? t.after === 'pass' : t.before === 'pass';
                return (
                  <Row
                    key={t.name}
                    label={<b className="mono" style={{ fontSize: 12 }}>{t.name}</b>}
                    sub={t.note}
                    value={ok
                      ? <Badge tone="ok"><Check size={11} /> pass</Badge>
                      : <Badge tone="hold"><Close size={11} /> fail</Badge>}
                  />
                );
              })}
            </div>

            {patched ? (
              <div className="callout ok" style={{ marginTop: 20 }}>
                <Check size={16} />
                <div>
                  <h4>Code verified in an isolated sandbox</h4>
                  <p>All {passAfter} tests pass, including the worked example from the published standard. The container had no network interface to use.</p>
                </div>
              </div>
            ) : null}
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel
              title={showAfter ? 'flow_calc_verified.py' : 'flow_calc.py, as submitted'}
              note={showAfter
                ? 'Three lines changed, eight added: the unit conversion, the corrected factor, two guards and a docstring.'
                : 'Two faults, on the lines marked. Neither is a typo — both are the kind of mistake that passes review.'}
              action={
                <div className="btn-row">
                  <button type="button" className={showAfter ? 'chip' : 'chip on'} aria-pressed={!showAfter} onClick={() => setView('before')}>Submitted</button>
                  <button type="button" className={showAfter ? 'chip on' : 'chip'} aria-pressed={showAfter} onClick={() => setView('after')}>Patched</button>
                </div>
              }
            >
              <pre className="code" tabIndex={0} aria-label={showAfter ? 'patched source' : 'submitted source'}>{showAfter ? FIXED_CODE : BROKEN_CODE}</pre>
            </Panel>

            <Panel title="What it did, step by step" note="Select any step to see why it exists and what the runner returned." action={<SimNote />}>
              <AgentTimeline steps={SC.steps} states={states} />
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <div className="grid two">
            <Panel title="What the container is allowed to do" note="Generated code is the obvious way for something to phone home. It runs with nothing to phone home with.">
              {SANDBOX_LIMITS.map((l) => (
                <Row key={l.k} label={<b>{l.k}</b>} sub={l.v} />
              ))}
            </Panel>

            <Panel title="Runner output" note="Copied from the two executions.">
              <pre className="code" tabIndex={0} aria-label="sandbox runner output">{`$ python -m pytest tests/test_flow.py
${TESTS.length - passBefore} failed, ${passBefore} passed in 0.38s
  test_reference_case: expected 41.7 m3/h, got 4.17 m3/h

  ...patch applied...

$ python -m pytest tests/test_flow.py
${passAfter} passed in 0.42s
  test_reference_case: 41.7 m3/h — matches ISO 5167-2

$ ruff check flow_calc_verified.py
All checks passed.`}</pre>

              <div style={{ marginTop: 18 }}>
                {artifacts.length === 0 ? (
                  <Empty title="No file yet">The verified module is written when the second execution clears.</Empty>
                ) : (
                  artifacts.map((a) => (
                    <Row key={a.id} label={<b>{a.name}</b>} sub={a.note}
                      value={<Button size="sm" onClick={() => { downloadArtifact(a); toast('Saved to your downloads', a.name); }}><Download size={13} /> Save</Button>} />
                  ))
                )}
              </div>

              <Disclosure summary="Technical details — the two defects">
                <p style={{ fontSize: 'var(--text-sm)', marginBottom: 8 }}>
                  <b>1. Units.</b> <code className="mono">dp_mbar</code> was used as though it were pascals.
                  1 mbar = 100 Pa, and the value appears under a square root, so the result came out low by √100 = 10.
                </p>
                <p style={{ fontSize: 'var(--text-sm)' }}>
                  <b>2. Velocity-of-approach factor.</b> Written as <code className="mono">1/(1 − β⁴)</code> instead of{' '}
                  <code className="mono">1/√(1 − β⁴)</code>, per ISO 5167-2 §5.1.
                </p>
              </Disclosure>
            </Panel>
          </div>
        </div>
      </section>
    </Shell>
  );
}
