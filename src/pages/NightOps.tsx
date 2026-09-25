import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Badge, Empty, Dot, SimNote } from '../components/ui';
import { Sparkline } from '../components/diagrams';
import { useEgress } from '../state/useEgress';
import { useApp } from '../state/store';
import { useAudit } from '../state/useAudit';
import { ocr, OCR_THRESHOLD } from '../services/ocr';
import { SCENARIOS } from '../data/scenarios';
import { MODELS } from '../data/corpus';
import { hourly } from '../data/telemetry';
import { clock } from '../lib/format';
import { Moon, ArrowRight } from '../components/icons';

/* KAVACH after hours — the same product, not a different one. Purple
   appears as a marker on the band and a dot beside the queue, and
   nowhere else. The chrome, the palette and the components are the
   ones every other screen uses. */

const QUEUE = [
  { t: 'Thickness survey batch — units 02 and 03', when: 'queued for 02:00', why: 'scheduled overnight so the GPU is free during the day' },
  { t: 'Re-index Contractor Rate Schedule 2026', when: 'queued for 03:15', why: 'the document arrived today and is not yet searchable' },
  { t: 'Weekly relief-device register reconciliation', when: 'queued for 04:00', why: 'compares field mark-ups against the register' },
];

export default function NightOps() {
  const blocked = useEgress();
  const app = useApp();
  const events = useAudit();
  const held = ocr.belowThreshold();
  const run = app.run;
  const active = !!run && run.finishedAt === null;
  const steps = run ? SCENARIOS[run.scenario].steps : [];
  const current = run ? run.stepStates.indexOf('active') : -1;
  const loaded = MODELS.filter((m) => m.state === 'loaded');

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow={<><Moon size={13} /> Night Ops</>}
          title="The node after hours."
          lede="Nobody is at the desk, but the machine is still working. Long jobs run overnight while the GPU is free, anything the models were unsure about waits for someone to look at it in the morning, and the boundary is watched the whole time."
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="night-band" style={{ marginBottom: 30 }}>
            <div style={{ display: 'flex', gap: 'var(--s-4)', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              <div style={{ minWidth: 0, flex: 1 }}>
                <h2>{held.length ? `${held.length} page waiting on a human read.` : 'All systems nominal.'}</h2>
                <p>
                  Node isolated · {active ? '1 job running' : 'queue idle'} · {loaded.length} models resident ·{' '}
                  {blocked.length} outbound attempt{blocked.length === 1 ? '' : 's'} refused
                </p>
              </div>
              <div style={{ minWidth: 220 }}>
                <Sparkline values={hourly()} label="Node activity over the last 24 hours" height={52} />
                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                  <span className="mono" style={{ fontSize: 11, color: '#7E7874' }}>24h ago</span>
                  <span className="mono" style={{ fontSize: 11, color: '#7E7874' }}>now</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid four" style={{ marginBottom: 30 }}>
            <Stat value={active ? 1 : 0} label="jobs running now" boxed accent />
            <Stat value={QUEUE.length} label="jobs queued for overnight" boxed />
            <Stat value={held.length} label="items waiting on a human" boxed />
            <Stat value={blocked.length} label="outbound attempts refused" boxed />
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel title="Running now" note={active ? 'You can close this screen — the job keeps going.' : 'Nothing is running. The queue below starts at 02:00.'}>
              {active && current >= 0 ? (
                <>
                  <div className="night-row">
                    <span className="t">now</span>
                    <span className="m"><b>{steps[current]!.title}</b><br /><span className="u-muted" style={{ fontSize: 13 }}>{steps[current]!.tool}</span></span>
                    <span className="s"><Badge tone="accent"><Dot tone="accent" /> working</Badge></span>
                  </div>
                  <Row label={<b>{run!.label}</b>} sub={`step ${current + 1} of ${steps.length}`} value={<Link to={run!.scenario === 'code' ? '/app/sandbox' : '/app/run'} className="linkish">Open</Link>} />
                </>
              ) : (
                <Empty title="Queue idle">Models are resident and warm; nothing has been dispatched.</Empty>
              )}
            </Panel>

            <Panel title="Queued for tonight" note="Long jobs are held back until the GPU is not needed for interactive work." action={<SimNote>Illustrative schedule</SimNote>}>
              {QUEUE.map((q) => (
                <div className="night-row" key={q.t}>
                  <span className="t"><Dot tone="purple" /></span>
                  <span className="m"><b>{q.t}</b><br /><span className="u-muted" style={{ fontSize: 13 }}>{q.why}</span></span>
                  <span className="s mono u-dim" style={{ fontSize: 11 }}>{q.when}</span>
                </div>
              ))}
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <div className="grid two">
            <Panel title="Waiting on a human" note="KAVACH does not guess overnight and present it as fact in the morning.">
              {held.length === 0 ? (
                <Empty title="Nothing held">Everything read above the release threshold.</Empty>
              ) : (
                held.map((p) => (
                  <Row
                    key={p.page}
                    label={<b>Page {p.page} of Inspection_Report_Unit_04.pdf</b>}
                    sub={`read at ${p.confidence.toFixed(2)}, below the ${OCR_THRESHOLD.toFixed(2)} threshold — excluded from the approval note and named in it`}
                    value={<Link to="/app/documents" className="linkish">Review</Link>}
                  />
                ))
              )}
            </Panel>

            <Panel title="Boundary watch" note="The guard does not sleep either. Every attempt is logged with the mechanism that made it.">
              {blocked.length === 0 ? (
                <Empty title="No outbound call attempted" action={<Link to="/app/sovereignty" className="btn ghost sm">Open the monitor <ArrowRight size={13} /></Link>}>
                  Nothing has tried to leave the machine since this session opened.
                </Empty>
              ) : (
                blocked.slice(0, 6).map((b, i) => (
                  <div className="night-row" key={`${b.at}-${i}`}>
                    <span className="t">{clock(b.at)}</span>
                    <span className="m"><b>{b.host}</b><br /><span className="u-muted" style={{ fontSize: 13 }}>refused via {b.mechanism}</span></span>
                    <span className="s"><Badge tone="hold">refused</Badge></span>
                  </div>
                ))
              )}
              <p className="panel-note" style={{ marginTop: 16, marginBottom: 0 }}>{events.length} events in the ledger this session.</p>
            </Panel>
          </div>
        </div>
      </section>
    </Shell>
  );
}
