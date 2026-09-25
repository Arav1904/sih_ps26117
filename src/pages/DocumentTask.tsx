import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Conf, Disclosure, Callout, Badge, SimNote } from '../components/ui';
import { ConfidenceChart, PageScan } from '../components/charts';
import { ScanAnimation } from '../components/diagrams';
import { ocr, OCR_THRESHOLD } from '../services/ocr';
import { SCANNED_PAGES } from '../data/corpus';
import { pct } from '../lib/format';
import { Alert, ArrowRight } from '../components/icons';

export default function DocumentTask() {
  const pages = ocr.pages();
  const [pageIdx, setPageIdx] = useState(0);
  const [region, setRegion] = useState<number | null>(null);
  const page = pages[pageIdx]!;
  const held = ocr.belowThreshold();

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Documents and drawings"
          title="What the models actually read."
          lede="Most of what arrives is not typed text. It is a scan of a scan, a drawing with a pen mark on it, a photograph taken on a phone in the plant. This screen shows what KAVACH saw when it read one — including the parts it could not read well enough to use."
          ps="a multimodal task involving image or scanned-document understanding"
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 32 }}>
            <Stat value={`${pages.length} of ${SCANNED_PAGES}`} label="scanned pages shown — the ones the run cited or flagged" boxed />
            <Stat value={pct(ocr.meanConfidence())} label="average confidence across the four shown" boxed />
            <Stat value={held.length} label={`page${held.length === 1 ? '' : 's'} held back for a human to read`} accent boxed />
          </div>

          {held.length ? (
            <div style={{ marginBottom: 28 }}>
              <Callout title="Human review required" icon={<Alert size={16} />}>
                Page {held.map((p) => p.page).join(' and ')} came back at {held.map((p) => p.confidence.toFixed(2)).join(' and ')},
                below the {OCR_THRESHOLD.toFixed(2)} threshold KAVACH will release at. Nothing from{' '}
                {held.length === 1 ? 'it' : 'them'} was carried into the approval note. The note names the page, so the
                engineer signing knows exactly what they still have to check by eye.
              </Callout>
            </div>
          ) : null}

          <Panel
            title="How sure it was, page by page"
            note="A solid bar was released into the approval note. A dashed bar was not. The engine name under each bar shows where the second reader took over."
            action={<SimNote>Fixed demonstration scores</SimNote>}
          >
            <div className="chart-scroll">
              <ConfidenceChart
                points={pages.map((p) => ({ label: `page ${p.page}`, value: p.confidence, engine: p.engine }))}
                threshold={OCR_THRESHOLD}
                title="Reading confidence by page against the release threshold"
              />
            </div>
            <div className="legend">
              <span><i style={{ background: 'var(--color-burgundy)' }} />released into the deliverable</span>
              <span><i style={{ background: 'var(--color-burgundy)', opacity: .28, border: '1px dashed var(--color-burgundy)' }} />held for a human read</span>
            </div>
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel
              title="What it saw on the page"
              note="Pick a page, then a box, to see the text it produced and how sure it was. A dashed box fell below the threshold."
              action={
                <div className="btn-row">
                  {pages.map((p, i) => (
                    <button key={p.page} type="button" className={i === pageIdx ? 'chip on' : 'chip'} aria-pressed={i === pageIdx}
                      onClick={() => { setPageIdx(i); setRegion(null); }}>
                      p.{p.page}
                    </button>
                  ))}
                </div>
              }
            >
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                <div style={{ width: 240, maxWidth: '100%' }}>
                  <PageScan regions={page.regions} threshold={OCR_THRESHOLD} selected={region} onSelect={setRegion} />
                </div>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <Row
                    label={<b>Page {page.page}</b>}
                    sub={`${page.regions.length} blocks of text found · read by ${page.engine}${page.firstPass !== undefined && page.firstPass !== page.confidence ? ` after a first attempt at ${page.firstPass.toFixed(2)}` : ''}`}
                    value={<Conf value={page.confidence} threshold={OCR_THRESHOLD} />}
                  />
                  {page.regions.map((r, i) => (
                    <Row
                      key={i}
                      n={String(i + 1).padStart(2, '0')}
                      onClick={() => setRegion(region === i ? null : i)}
                      selected={region === i}
                      label={<span>{r.text}</span>}
                      value={<Conf value={r.conf} threshold={OCR_THRESHOLD} />}
                    />
                  ))}
                </div>
              </div>
            </Panel>

            <Panel
              title="The drawing, read by the vision model"
              note="Sheet 7 is a P&ID with a pen annotation on it. This is the finding a text-only system would have missed entirely, because the number that matters was written by hand."
            >
              <div style={{ display: 'flex', gap: 22, flexWrap: 'wrap', marginBottom: 20 }}>
                <ScanAnimation running={false} />
                <div style={{ flex: 1, minWidth: 200 }}>
                  <Row n="01" label={<b>Sheet identified</b>} sub="P&ID sheet 7, overhead circuit — 3 instrument bubbles located" value={<Conf value={0.93} plain />} />
                  <Row n="02" label={<b>Handwriting found</b>} sub={'beside PSV-04-22: "set press. revised 14.8 barg — 11/02"'} value={<Conf value={0.88} threshold={OCR_THRESHOLD} />} />
                  <Row n="03" label={<b>Checked against the register</b>} sub="the relief device register still shows 15.4 barg — the field mark-up and the record disagree by 0.6 barg" value={<Badge tone="hold">mismatch</Badge>} />
                  <Row n="04" label={<b>What happens next</b>} sub="raised as finding F-03; a management-of-change request is the recommended action under MOC-PR-009 §3" value={<Badge tone="hold">high</Badge>} />
                </div>
              </div>
              <Link to="/app/archive" className="linkish">Open the full report page by page <ArrowRight size={13} style={{ display: 'inline' }} /></Link>
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel title="Why a held page beats a confident guess" note="This is the product decision that matters most on this screen.">
            <Row n="01" label={<b>A second reader runs first</b>} sub={`Any page the primary engine scores below ${OCR_THRESHOLD.toFixed(2)} is re-read by a different one. Page 6 first came back at ${pages.find((p) => p.page === 6)!.firstPass!.toFixed(2)}; the second engine read it at ${pages.find((p) => p.page === 6)!.confidence.toFixed(2)} — usable, and labelled with which engine produced it.`} />
            <Row n="02" label={<b>What neither reader could recover stays out</b>} sub={`Page 8 scored ${pages.find((p) => p.page === 8)!.confidence.toFixed(2)} on both. It is excluded from the approval note and named in the verification record.`} />
            <Row n="03" label={<b>No score is ever shown on its own</b>} sub="A number with no status word invites the reader to decide what 0.68 means. Every score here arrives with released or held attached." />
            <Disclosure summary="Technical details — engines, thresholds and region geometry">
              <table className="kv-table">
                <thead><tr><th>Page</th><th>Engine</th><th>First pass</th><th>Final</th><th>Regions</th><th>Verdict</th></tr></thead>
                <tbody>
                  {pages.map((p) => (
                    <tr key={p.page}>
                      <td className="mono">{p.page}</td><td>{p.engine}</td>
                      <td className="mono">{p.firstPass?.toFixed(2) ?? '—'}</td>
                      <td className="mono">{p.confidence.toFixed(2)}</td>
                      <td className="mono">{p.regions.length}</td>
                      <td>{p.confidence < OCR_THRESHOLD ? 'held' : 'released'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="u-muted" style={{ fontSize: 'var(--text-sm)', marginTop: 12 }}>
                Page-level confidence is the engine's own figure. Region scores are measured separately, which is why
                a released page can still hold one block back.
              </p>
            </Disclosure>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
