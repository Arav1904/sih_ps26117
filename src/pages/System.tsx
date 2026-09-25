import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Badge, Disclosure, Callout, Button, Dot } from '../components/ui';
import { VramBar, Histogram } from '../components/charts';
import { MODELS, GPU_TOTAL_GB, KNOWLEDGE } from '../data/corpus';
import { modelRouter } from '../services/modelRouter';
import { hourly, totalDispatches, meanLatencyMs, fallbackCount } from '../data/telemetry';
import { knowledge } from '../services/knowledge';
import { store, useApp } from '../state/store';
import { useAuth } from '../state/useAuth';
import { ROLE_LABEL } from '../services/auth';
import { Cpu } from '../components/icons';

export default function System() {
  const app = useApp();
  const user = useAuth();
  const loaded = modelRouter.loaded();
  const standby = MODELS.filter((m) => m.state !== 'loaded');
  const committed = modelRouter.vramCommitted();

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow={<><Cpu size={13} /> System</>}
          title="The node."
          lede="One GPU server, seven open-weight models, no route out. Everything on this screen is measured on this machine — and the figures here and the charts beside them read the same arrays, so they cannot disagree."
        />
      </div>

      <section className="section first">
        <div className="container">
          <Panel
            title="Run mode"
            note="Demo mode is a deterministic simulation of the agent: the same steps, the same timings, the same figures on every machine, which is what makes a demonstration reproducible. Live local mode calls a real orchestrator on this node."
          >
            <div className="chip-row" style={{ marginBottom: 20 }}>
              <button type="button" className={app.mode === 'demo' ? 'chip on' : 'chip'} aria-pressed={app.mode === 'demo'} onClick={() => store.setMode('demo')}>
                Demo mode
              </button>
              <button type="button" className={app.mode === 'live' ? 'chip on' : 'chip'} aria-pressed={app.mode === 'live'} onClick={() => store.setMode('live')}>
                Live local mode
              </button>
            </div>

            {app.mode === 'live' ? (
              app.liveUnavailable ? (
                <Callout title="No orchestrator is listening on this machine">
                  KAVACH tried <b className="mono">http://127.0.0.1:8000/healthz</b> and nothing answered. That call
                  was <i>permitted</i> by the network policy — loopback is inside the boundary — it simply had nowhere
                  to land. This prototype ships without the FastAPI backend; the frontend is written so that adding one
                  changes no screen. Until then, demo mode is what you want.
                  <br /><br />
                  <Button variant="solid" onClick={() => store.setMode('demo')}>Switch back to demo mode</Button>
                </Callout>
              ) : (
                <Callout tone="ok" title="Connected to the local orchestrator">
                  Steps and figures now come from the node rather than from the simulation.
                </Callout>
              )
            ) : (
              <Callout tone="neutral" title="Demo mode is active">
                Agent timings, OCR confidences and routing statistics are fixed demonstration values. The network
                policy, the audit ledger and the generated Word and Excel files are real in both modes.
              </Callout>
            )}
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 30 }}>
            <Stat value={`${committed.toFixed(1)} GB`} label={`of ${GPU_TOTAL_GB} GB GPU memory committed`} accent boxed />
            <Stat value={totalDispatches()} label="tasks routed in the last 24 hours" boxed />
            <Stat value={modelRouter.families()} label="distinct model families on the node" boxed />
          </div>

          <div className="grid two">
            <Panel
              title="Models resident on the node"
              note={`${loaded.length} loaded now, ${standby.length} available to load. A model is a row in a registry, not a code path — adding one is a configuration change.`}
            >
              <div className="chart-scroll">
                <VramBar segments={loaded.map((m) => ({ label: m.id, gb: m.vramGb }))} total={GPU_TOTAL_GB} />
              </div>
              <div style={{ marginTop: 12 }}>
                {loaded.map((m) => (
                  <Row key={m.id} label={<b>{m.name}</b>} sub={m.role} value={<Badge tone="ok"><Dot tone="ok" /> {m.vramGb} GB</Badge>} />
                ))}
                {standby.map((m) => (
                  <Row key={m.id} label={m.name} sub={`${m.role} — not loaded`} value={<Badge>{m.state}</Badge>} />
                ))}
              </div>
              <Disclosure summary="Technical details — how to add a model">
                <pre className="code">{`// src/data/corpus.ts
{ id: 'your-model', name: 'Your-Model-7B', role: 'what it is for',
  quant: 'Q4_K_M', vramGb: 8, context: '32k',
  state: 'available', modality: 'text', tokensPerSec: 0 }

// then name it as a candidate in src/data/telemetry.ts
{ modelId: 'your-model', share: 1, note: 'when the router should pick it' }`}</pre>
                <p className="u-muted" style={{ fontSize: 'var(--text-sm)', marginTop: 10 }}>
                  No component changes. That is what model-agnostic means in practice.
                </p>
              </Disclosure>
            </Panel>

            <Panel
              title="Throughput"
              note={`${totalDispatches()} dispatches over 24 hours, averaging ${(meanLatencyMs() / 1000).toFixed(1)}s each. ${fallbackCount()} of them were passed to a fallback model after the first choice scored badly.`}
            >
              <div className="chart-scroll">
                <Histogram buckets={hourly()} title="Dispatches per hour over the last 24 hours" xLabel="24 hours ago → now, one bar per hour" />
              </div>
              <div style={{ marginTop: 18 }}>
                <Row label={<b>Node</b>} sub="one GPU server inside the site boundary" value="MRPL-GPU-01" />
                <Row label={<b>Signed in as</b>} sub={user ? `${user.email} · demonstration account` : 'not signed in'} value={user ? ROLE_LABEL[user.role] : '—'} />
                <Row label={<b>Knowledge base</b>} sub={`${knowledge.indexed().length} of ${KNOWLEDGE.length} documents indexed`} value={`${knowledge.passages().toLocaleString('en-IN')} passages`} />
                <Row label={<b>Session state</b>} sub="runs and artifacts are kept in this browser for the length of the session only" value={`${app.history.length} runs`} />
              </div>
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel title="The local knowledge base" note="Your own procedures, standards and schedules. Answers cite these; nothing is recalled from a model's memory without a retrievable clause behind it.">
            {KNOWLEDGE.map((d) => (
              <Row key={d.id} label={<b>{d.id}</b>} sub={`${d.title} — ${d.collection} · ${d.pages} pages`} value={d.indexed ? `${d.passages} passages` : <Badge>not indexed</Badge>} />
            ))}
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
