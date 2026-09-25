import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Badge, Conf, Callout } from '../components/ui';
import { ocr, OCR_THRESHOLD } from '../services/ocr';
import { FINDINGS } from '../data/corpus';
import { Shield, ArrowRight } from '../components/icons';

/* The document viewer keeps its paper feel — cream, typewriter face,
   a stamp — but only inside the card. The page around it is the same
   chrome as every other screen, so a visitor who lands here is never
   stranded in what looks like a different product. */

export default function Archive() {
  const pages = ocr.pages();
  const [idx, setIdx] = useState(0);
  const page = pages[idx]!;
  const held = page.confidence < OCR_THRESHOLD;
  const onPage = FINDINGS.filter((f) => f.page === page.page);

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Archive"
          title="The source document, page by page."
          lede="The transcription KAVACH worked from, kept on the local artifact store with the findings each page produced. Every line carries the confidence it was read at, so you can see exactly what the approval note was built on."
        />
      </div>

      <section className="section first last">
        <div className="container">
          <div className="chip-row" style={{ marginBottom: 'var(--s-6)' }}>
            {pages.map((p, i) => (
              <button key={p.page} type="button" className={i === idx ? 'chip on' : 'chip'} aria-pressed={i === idx} onClick={() => setIdx(i)}>
                Page {p.page}
              </button>
            ))}
          </div>

          <div className="grid wide-first">
            <article className="doc-viewer">
              <span className="doc-stamp">SOVEREIGN</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-burgundy)', fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 13, marginBottom: 16 }}>
                <Shield size={14} color="var(--color-burgundy)" /> KAVACH ARCHIVE
              </div>
              <p className="doc-meta">Ref. INSP-0472 · retained on the local artifact store</p>
              <h2 style={{ fontSize: 'var(--text-xl)', margin: '6px 0 6px' }}>Inspection findings — unit 04, crude distillation</h2>
              <p className="doc-meta">
                Inspection_Report_Unit_04.pdf · 14 pages, 9 of them scans · read on the on-premise node ·
                page {page.page} transcribed by {page.engine}
              </p>
              <hr className="doc-rule" />

              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 12 }}>Transcription, page {page.page}</h3>
              <div className="doc-type">
                {page.regions.map((r, i) => (
                  <p key={i}>
                    {r.text}
                    <span style={{ color: r.conf < OCR_THRESHOLD ? 'var(--color-burgundy)' : 'var(--color-paper-doc-sec)', fontSize: 12 }}>
                      {'  '}[{r.conf.toFixed(2)} · {r.conf < OCR_THRESHOLD ? 'held' : 'released'}]
                    </span>
                  </p>
                ))}
              </div>

              {held ? (
                <div style={{ marginTop: 20 }}>
                  <Callout title="This page was held back">
                    It scored {page.confidence.toFixed(2)} against a release threshold of {OCR_THRESHOLD.toFixed(2)}.
                    Nothing from it was carried into the approval note. It is waiting on a human read.
                  </Callout>
                </div>
              ) : null}

              <hr className="doc-rule" />
              <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 12 }}>Findings raised from this page</h3>
              {onPage.length === 0 ? (
                <div className="doc-row"><span>No finding was raised from page {page.page}.</span></div>
              ) : (
                onPage.map((f) => (
                  <div className="doc-row" key={f.ref}>
                    <span style={{ minWidth: 0 }}>
                      <b>{f.ref} · {f.tag}</b><br />
                      {f.text}<br />
                      <span style={{ color: 'var(--color-paper-doc-sec)' }}>{f.clause} — {f.action}</span>
                    </span>
                    <span className="val">{f.severity}</span>
                  </div>
                ))
              )}
            </article>

            <div className="stack">
              <Panel title="This page" note="How the transcription of the page you are reading was produced.">
                <Row label={<b>Read by</b>} sub={page.firstPass !== undefined && page.firstPass !== page.confidence ? `second engine, after a first attempt at ${page.firstPass.toFixed(2)}` : 'primary engine, first attempt'} value={page.engine} />
                <Row label={<b>Blocks of text found</b>} sub="each one scored separately" value={page.regions.length} />
                <Row label={<b>Page confidence</b>} sub={held ? 'below the release threshold' : 'above the release threshold'} value={<Conf value={page.confidence} threshold={OCR_THRESHOLD} />} />
                <Row label={<b>Findings from this page</b>} sub={onPage.length ? onPage.map((f) => f.ref).join(', ') : 'none'} value={onPage.length} />
              </Panel>

              <Panel title="Every finding in this report" note="Four in total, across the fourteen pages." foot={<Link to="/app/run" className="linkish">Back to the agent run <ArrowRight size={13} style={{ display: 'inline' }} /></Link>}>
                {FINDINGS.map((f) => (
                  <Row
                    key={f.ref}
                    n={f.ref.slice(2)}
                    onClick={() => { const i = pages.findIndex((p) => p.page === f.page); if (i >= 0) setIdx(i); }}
                    selected={f.page === page.page}
                    label={<b>{f.tag}</b>}
                    sub={f.text}
                    value={<Badge tone={f.severity === 'high' ? 'hold' : 'plain'}>p.{f.page}</Badge>}
                  />
                ))}
              </Panel>
            </div>
          </div>
        </div>
      </section>
    </Shell>
  );
}
