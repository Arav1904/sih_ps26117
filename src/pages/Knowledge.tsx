import { useState } from 'react';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Disclosure, Empty, Badge, SimNote } from '../components/ui';
import { knowledge } from '../services/knowledge';
import { KNOWLEDGE, FINDINGS } from '../data/corpus';
import { Search, ArrowRight } from '../components/icons';

const QUESTIONS = [
  { q: 'What is the retirement limit for a shell course?', ref: 'F-01' },
  { q: 'When does an exchanger need its bundle cleaned?', ref: 'F-02' },
  { q: 'A field mark-up disagrees with the relief register — what now?', ref: 'F-03' },
  { q: 'Is a seal weep with no measurable leak reportable?', ref: 'F-04' },
];

export default function Knowledge() {
  const [query, setQuery] = useState('');
  const [asked, setAsked] = useState(0);
  const docs = knowledge.search(query);
  const finding = FINDINGS.find((f) => f.ref === QUESTIONS[asked]!.ref)!;

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Knowledge"
          title="Where the answers came from."
          lede="KAVACH does not answer from memory. It finds the passage in your own procedures, quotes it, and tells you which document, which clause and which page it came from. If it cannot find one, it says so instead of inventing it."
          ps="grounded retrieval from an on-premise corpus"
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 32 }}>
            <Stat value={knowledge.indexed().length} label={`of ${KNOWLEDGE.length} documents indexed and searchable`} accent boxed />
            <Stat value={knowledge.passages().toLocaleString('en-IN')} label="passages available to cite" boxed />
            <Stat value={`${FINDINGS.length}/${FINDINGS.length}`} label="findings in the last run that carry a real clause" boxed />
          </div>

          <Panel
            title="Ask it something"
            note="Pick a question and watch the four stages: the question, the documents it searched, the passage it found, and the answer it gave."
            action={<SimNote>Fixed demonstration corpus</SimNote>}
          >
            <div className="chip-row" style={{ marginBottom: 24 }}>
              {QUESTIONS.map((q, i) => (
                <button key={q.q} type="button" className={i === asked ? 'chip on' : 'chip'} aria-pressed={i === asked} onClick={() => setAsked(i)}>
                  {q.q}
                </button>
              ))}
            </div>

            <div className="grid four tight">
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>01 · Question</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>{QUESTIONS[asked]!.q}</p>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>02 · Documents searched</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>{knowledge.indexed().length} indexed documents, {knowledge.passages().toLocaleString('en-IN')} passages</p>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>03 · Passage found</div>
                <p style={{ fontSize: 'var(--text-sm)' }}><b>{finding.clause}</b><br />page {finding.page} of the source report</p>
              </div>
              <div>
                <div className="eyebrow" style={{ marginBottom: 8 }}>04 · Answer</div>
                <p style={{ fontSize: 'var(--text-sm)' }}>{finding.action}</p>
              </div>
            </div>

            <Disclosure summary="Why was this source used?">
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 10 }}>
                The finding <b>{finding.ref}</b> on <b>{finding.tag}</b> states: {finding.text}
              </p>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                That measurement is governed by <b>{finding.clause}</b>, which is the passage the retrieval step
                returned with the highest score. The clause reference travels with the finding into the approval
                note, so a reader six months later can open the same page and check it.
              </p>
            </Disclosure>
          </Panel>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <div className="grid two">
            <Panel
              title="The corpus"
              note="Your own procedures, standards and rate schedules — indexed on the node, searchable without anything leaving it."
            >
              <label className="field" style={{ marginBottom: 16 }}>
                <span className="sr-only">Search the corpus</span>
                <span style={{ position: 'relative', display: 'block' }}>
                  <input className="input" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by title, code or collection" style={{ paddingLeft: 38 }} />
                  <span style={{ position: 'absolute', left: 12, top: 11, color: 'var(--color-muted-2)' }}><Search size={16} /></span>
                </span>
              </label>
              {docs.length === 0 ? (
                <Empty title="Nothing matched that">Try a document code such as SOP-MI, or a collection such as Process Safety.</Empty>
              ) : (
                docs.map((d) => (
                  <Row
                    key={d.id}
                    label={<b>{d.id}</b>}
                    sub={`${d.title} — ${d.collection} · ${d.pages} pages`}
                    value={d.indexed ? `${d.passages} passages` : <Badge tone="plain">not indexed</Badge>}
                  />
                ))
              )}
            </Panel>

            <Panel title="What the last run cited" note="Each finding it released is bound to the clause it was checked against. That pairing is what makes the note reviewable rather than merely plausible.">
              {knowledge.citations().map((f) => (
                <Row key={f.ref} n={f.ref.slice(2)} label={<b>{f.clause}</b>} sub={`${f.tag} — ${f.action}`} value={`p.${f.page}`} />
              ))}
              <div style={{ marginTop: 18 }}>
                <span className="linkish" style={{ borderBottom: 'none', color: 'var(--color-muted)', fontWeight: 400, fontSize: 13 }}>
                  An answer without a retrievable clause is a recollection, not a citation <ArrowRight size={12} style={{ display: 'inline' }} />
                </span>
              </div>
            </Panel>
          </div>
        </div>
      </section>
    </Shell>
  );
}
