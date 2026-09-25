import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Disclosure, SectionHead } from '../components/ui';
import { MODELS, KNOWLEDGE, TESTS, FINDINGS, SCANNED_PAGES } from '../data/corpus';
import { TASK_CLASSES } from '../data/telemetry';
import { ArrowRight } from '../components/icons';

const CAPS = [
  { t: 'Reads scanned paper', d: 'Pages with no text layer are transcribed, scored, and re-run through a second engine when the first one is unsure.', to: '/app/documents', proof: `${SCANNED_PAGES} scanned pages in the demonstration report` },
  { t: 'Reads drawings and handwriting', d: 'P&IDs, isometrics and field photographs, including pen annotations that a text-only system cannot see at all.', to: '/app/documents', proof: 'a revised set pressure, written by hand on sheet 7' },
  { t: 'Cites your own procedures', d: 'Answers are grounded in passages retrieved from your document corpus, with the document, clause and page attached.', to: '/app/knowledge', proof: `${FINDINGS.length} of ${FINDINGS.length} findings carry a retrievable clause` },
  { t: 'Writes and verifies code', d: 'Finds the fault, patches it, and then proves the patch by running the test suite in a container with no network namespace.', to: '/app/sandbox', proof: `${TESTS.filter((t) => t.after === 'pass').length} of ${TESTS.length} tests passing after the fix` },
  { t: 'Produces real deliverables', d: 'Word documents, spreadsheets and Python modules written to local disk — not chat replies you have to retype.', to: '/app/run', proof: 'generated in the browser, no library, no network' },
  { t: 'Keeps a record of everything', d: 'An append-only ledger of every task, every tool call, every refusal, exportable as a spreadsheet.', to: '/app/audit', proof: 'sequence numbers that are never reused' },
];

export default function Capabilities() {
  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Capabilities"
          title="What KAVACH can actually do."
          lede="Six capabilities, each with a screen behind it you can open and test. Nothing on this page is a roadmap item."
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="grid two">
            {CAPS.map((c) => (
              <Panel key={c.t} title={c.t} note={c.d} foot={<Link to={c.to} className="linkish">Open the screen <ArrowRight size={13} style={{ display: 'inline' }} /></Link>}>
                <div className="badge accent plain">{c.proof}</div>
              </Panel>
            ))}
          </div>
        </div>
      </section>

      <section className="section sunken last">
        <div className="container">
          <SectionHead title="The models on the node">
            Open-weight models only. Each one is a row in a registry — adding another is a configuration change, not a
            code change, which is what makes the architecture model-agnostic rather than merely claiming to be.
          </SectionHead>
          <div className="grid three" style={{ marginBottom: 26 }}>
            <Stat value={MODELS.length} label="models in the registry" accent boxed />
            <Stat value={TASK_CLASSES.length} label="kinds of work the router distinguishes" boxed />
            <Stat value={KNOWLEDGE.length} label="of your own documents indexed" boxed />
          </div>
          <Panel title="Registry">
            {MODELS.map((m) => (
              <Row key={m.id} label={<b>{m.name}</b>} sub={m.role} value={`${m.quant} · ${m.vramGb} GB · ${m.state}`} />
            ))}
            <Disclosure summary="Technical details — context windows and modality">
              <table className="kv-table">
                <thead><tr><th>Model</th><th>Modality</th><th>Context</th><th>VRAM</th><th>tok/s</th></tr></thead>
                <tbody>
                  {MODELS.map((m) => (
                    <tr key={m.id}>
                      <td className="mono">{m.id}</td><td>{m.modality}</td><td>{m.context}</td>
                      <td>{m.vramGb} GB</td><td>{m.tokensPerSec || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Disclosure>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
