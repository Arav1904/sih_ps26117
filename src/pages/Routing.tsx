import { useState } from 'react';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Disclosure, Badge, SimNote } from '../components/ui';
import { BarRows, Matrix } from '../components/charts';
import { RoutingFlow, Donut } from '../components/diagrams';
import { TASK_CLASSES, byModel, matrix, totalDispatches, fallbackCount, meanLatencyMs, byClass } from '../data/telemetry';
import { SCENARIOS } from '../data/scenarios';
import { classify } from '../lib/classify';

const SHORT: Record<string, string> = {
  'llama-3.3-70b': 'llama 70b', 'deepseek-r1-32b': 'deepseek 32b', 'qwen-coder-32b': 'qwen coder',
  'qwen-vl-7b': 'qwen vl', 'surya-ocr': 'surya ocr', tesseract: 'tesseract', 'sarvam-m': 'sarvam m',
};

const SAMPLES = [
  'Fix the failing test in flow_calc.py and show me the diff',
  'Read the mark-up on P&ID sheet 7 and tell me what changed',
  'These nine pages came back as scans — transcribe them',
  'Summarise this inspection report against the governing SOPs',
  'Draft a reply in Kannada to the vendor letter',
];

const FLOW = [
  { input: 'Python file', kind: 'Code', model: 'Coding model', why: 'reads and repairs source, then proves the fix by running the tests' },
  { input: 'P&ID drawing', kind: 'Image', model: 'Vision model', why: 'reads line-work, instrument bubbles and anything written by hand' },
  { input: 'Scanned page', kind: 'No text layer', model: 'OCR model', why: 'turns a photograph of paper into text that can be searched' },
  { input: 'Long report', kind: 'Analysis', model: 'Reasoning model', why: 'plans the job and holds the whole document in context' },
  { input: 'Hindi or Kannada letter', kind: 'Indic language', model: 'Language model', why: 'drafts correspondence in the script it arrived in' },
];

export default function Routing() {
  const [picked, setPicked] = useState(0);
  const m = matrix();
  const models = byModel();
  const decision = classify(SAMPLES[picked]!);

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Model routing"
          title="Nobody picks a model."
          lede="KAVACH looks at what you gave it — does the page carry a text layer, is there line-work in the image, is a test failing — and chooses accordingly. Adding a new model is a row in a registry; no screen and no code path changes."
          ps="model auto-selection across at least two different task types"
        />
      </div>

      <section className="section first">
        <div className="container">
          <Panel title="What goes where" note="Five kinds of input, five different local models. This is the whole idea, before any statistics.">
            <RoutingFlow rows={FLOW} />
            <p className="panel-note" style={{ marginTop: 20, marginBottom: 0 }}>
              KAVACH chooses based on what the task needs — not on how the request was worded. That is why a question
              phrased as a sentence about a drawing still goes to the vision model.
            </p>
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel title="Try it on a request" note="Pick one and the router shows what it keyed on, which model it chose, and why. This is the same classifier the command bar uses.">
              <div className="chip-row" style={{ marginBottom: 20 }}>
                {SAMPLES.map((s, i) => (
                  <button key={s} type="button" className={i === picked ? 'chip on' : 'chip'} aria-pressed={i === picked} onClick={() => setPicked(i)}>
                    {s.split(' ').slice(0, 3).join(' ')}…
                  </button>
                ))}
              </div>
              <Row n="01" label={<b>Request</b>} sub={SAMPLES[picked]} />
              <Row n="02" label={<b>Read as</b>} sub={TASK_CLASSES.find((t) => t.key === decision.key)!.trigger} value={decision.label} />
              <Row n="03" label={<b>Sent to</b>} sub={decision.reason} value={decision.modelName} />
              <Row n="04" label={<b>What left the node</b>} sub="the model is resident in GPU memory on this machine" value={<Badge tone="ok">nothing</Badge>} />
            </Panel>

            <Panel title="Where the work went" note={`${totalDispatches()} tasks over the last 24 hours on this node.`} action={<SimNote>Fixed demonstration log</SimNote>}>
              <Donut
                slices={byClass().map((c) => ({ label: TASK_CLASSES.find((t) => t.key === c.key)!.label, value: c.count }))}
                centerValue={totalDispatches()}
                centerLabel="tasks"
                caption="Tasks by kind over 24 hours"
              />
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 30 }}>
            <Stat value={TASK_CLASSES.length} label="kinds of work the router distinguishes" accent boxed />
            <Stat value={models.length} label="models that took work in the last 24 hours" boxed />
            <Stat value={`${((fallbackCount() / totalDispatches()) * 100).toFixed(1)}%`} label="of tasks passed to a fallback model" boxed />
          </div>

          <Panel title="The rule behind each kind of work" note="The observable property of the input that makes the router pick.">
            {TASK_CLASSES.map((t, i) => (
              <Row
                key={t.key}
                n={String(i + 1).padStart(2, '0')}
                label={<b>{t.label}</b>}
                sub={<>{t.trigger}<br />{t.candidates.map((c) => `${c.modelId} — ${c.note}`).join(' · ')}</>}
                value={`${m[t.key] ? Object.values(m[t.key]!).reduce((a, b) => a + b, 0) : 0} in 24h`}
              />
            ))}

            <Disclosure summary="Technical details — the full dispatch matrix">
              <p className="u-muted" style={{ fontSize: 'var(--text-sm)', marginBottom: 14 }}>
                A dark cell is a route the router takes often; a dot is a pairing it never chose. The empty cells are
                the interesting part — the coding model never touched a scanned page. Mean time on task across all
                dispatches is {(meanLatencyMs() / 1000).toFixed(1)}s.
              </p>
              <div className="chart-scroll">
                <Matrix
                  rows={TASK_CLASSES.map((t) => ({ key: t.key, label: t.label.length > 26 ? t.label.slice(0, 25) + '…' : t.label }))}
                  cols={models.map((x) => ({ key: x.modelId, label: SHORT[x.modelId] ?? x.modelId }))}
                  cell={(r, c) => m[r]?.[c] ?? 0}
                  title="Dispatches by task type and model"
                />
              </div>
              <div className="chart-scroll" style={{ marginTop: 20 }}>
                <BarRows
                  data={models.map((x) => ({ label: SHORT[x.modelId] ?? x.modelId, value: x.count, note: `mean ${(x.meanMs / 1000).toFixed(1)}s on task` }))}
                  unit="dispatches"
                  title="Dispatches by model over 24 hours"
                />
              </div>
            </Disclosure>
          </Panel>

          <div className="grid two" style={{ marginTop: 26 }}>
            {Object.values(SCENARIOS).map((sc) => (
              <Panel key={sc.key} title={`Route taken: ${sc.label.toLowerCase()}`} note={`${sc.routing.length} capabilities engaged for one request — the decision the run on the agent screen actually executed.`}>
                {sc.routing.map((r, i) => (
                  <Row key={r.target} n={String(i + 1).padStart(2, '0')} label={<b>{r.target}</b>} sub={`${r.observation} — ${r.reason}`} />
                ))}
              </Panel>
            ))}
          </div>
        </div>
      </section>
    </Shell>
  );
}
