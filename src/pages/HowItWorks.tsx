import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Disclosure, SectionHead, Callout } from '../components/ui';
import { WorkflowSpine, ArchitectureStack, RoutingFlow } from '../components/diagrams';
import { SCENARIOS } from '../data/scenarios';
import { STAGES } from '../data/stages';
import { ArrowRight } from '../components/icons';

export default function HowItWorks() {
  const sc = SCENARIOS.inspection;
  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="How KAVACH works"
          title="One job, carried the whole way."
          lede="Most AI tools answer a question. KAVACH takes a piece of work, does every part of it, checks its own answer, and hands you a file. This page is that sequence, explained without a single piece of jargon."
        />
      </div>

      <section className="section first">
        <div className="container">
          <WorkflowSpine />
        </div>
      </section>

      <section className="section sunken">
        <div className="container">
          <SectionHead title="The seven stages, one at a time">
            Each stage below is something you can watch happen on the agent-run screen.
          </SectionHead>
          <div className="grid two">
            {STAGES.map((s, i) => (
              <Panel key={s.key} title={`${String(i + 1).padStart(2, '0')} · ${s.label}`} note={s.plain}>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                  {i === 0 && 'Files are read from a folder on the node. Nothing is uploaded and nothing is copied off the machine.'}
                  {i === 1 && 'Before any model is chosen, KAVACH decides what kind of job this is and what you expect back at the end.'}
                  {i === 2 && 'A scan, a drawing and a piece of reasoning need three different models. The system chooses, and shows you why.'}
                  {i === 3 && 'The long part: transcribe, read, extract, look up, cross-check, calculate, draft. Each step is visible as it runs.'}
                  {i === 4 && 'Citations, arithmetic, completeness and coverage are checked. A check that fails flags the deliverable rather than blocking it silently.'}
                  {i === 5 && 'A Word file, a spreadsheet or a tested module, written to disk. You can open it, edit it and sign it.'}
                  {i === 6 && 'Every step above was written to an append-only record as it happened, with a sequence number that is never reused.'}
                </p>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="grid wide-first">
            <Panel
              title="A real run, step by step"
              note={`This is the inspection review exactly as it executes — ${sc.steps.length} steps, seven distinct local tools.`}
              action={<Link to="/app/run" className="btn ghost sm">Watch it run <ArrowRight size={13} /></Link>}
            >
              {sc.steps.map((s, i) => (
                <Row key={s.title} n={String(i + 1).padStart(2, '0')} label={<b>{s.title}</b>} sub={s.why} value={s.tool} />
              ))}
              <Disclosure summary="Technical details — what each tool returned">
                <div className="code" style={{ whiteSpace: 'pre-wrap' }}>
                  {sc.steps.map((s) => `[${s.tool}] ${s.title}\n${s.detail}`).join('\n\n')}
                </div>
              </Disclosure>
            </Panel>

            <div className="stack">
              <Panel title="How it is put together">
                <ArchitectureStack />
              </Panel>
              <Callout title="What is simulated, and what is not">
                The agent timeline, the confidence scores and the routing figures are deterministic demonstration
                logic — they are identical on every machine, which is what makes the demo reproducible. The network
                policy, the audit ledger and the Word and Excel files are real: the files are generated in the
                browser with no library and no network, and they open in Office.
              </Callout>
            </div>
          </div>
        </div>
      </section>

      <section className="section sunken last">
        <div className="container">
          <SectionHead title="How it chooses which AI to use">
            The router reads the input, not the wording of the request. That is why a question phrased as a sentence
            about a drawing still goes to the vision model.
          </SectionHead>
          <Panel>
            <RoutingFlow rows={[
              { input: 'Python file', kind: 'Code', model: 'Coding model', why: 'reads and repairs source, then proves the fix in a sandbox' },
              { input: 'P&ID drawing', kind: 'Image', model: 'Vision model', why: 'reads line-work, instrument bubbles and handwriting' },
              { input: 'Scanned page', kind: 'No text layer', model: 'OCR model', why: 'turns a photograph of paper into searchable text' },
              { input: 'Long report', kind: 'Analysis', model: 'Reasoning model', why: 'plans the job and holds the whole document in context' },
              { input: 'Hindi or Kannada letter', kind: 'Indic language', model: 'Language model', why: 'drafts correspondence in the script it arrived in' },
            ]} />
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
