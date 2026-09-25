import { Link, useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Panel, Badge, SectionHead, Stat, SimNote, Row } from '../components/ui';
import { HeroPipeline, WorkflowSpine, BoundaryDiagram, RoutingFlow, ArchitectureStack } from '../components/diagrams';
import { ArrowRight, Play, Doc, Image, Code, Search, Lock, Check } from '../components/icons';
import { MODELS, KNOWLEDGE, FINDINGS } from '../data/corpus';
import { TASK_CLASSES, totalDispatches } from '../data/telemetry';
import { SCENARIOS } from '../data/scenarios';
import { store } from '../state/store';
import { useEgress } from '../state/useEgress';

const USE_CASES = [
  { icon: Doc, t: 'Inspection reports that came back as scans', d: 'Fourteen pages, nine of them photographs of paper. KAVACH transcribes them, pulls out every finding, and ties each one to the procedure clause that governs it.' },
  { icon: Image, t: 'Drawings with a pen mark on them', d: 'Someone wrote a revised set pressure on sheet 7 by hand. A text-only system misses the number that matters most. The vision model does not.' },
  { icon: Code, t: 'Internal calculations you cannot paste anywhere', d: 'It finds the fault, fixes it, and then proves the fix by running the tests in a container with no network attached.' },
  { icon: Search, t: 'Procedures nobody can find quickly', d: 'Ask a question in plain words. The answer comes back with the document, the clause and the page it was taken from.' },
];

const ROUTE_ROWS = [
  { input: 'Python file', kind: 'Code', model: 'Coding model', why: 'reads and repairs source, then proves the fix in a sandbox' },
  { input: 'P&ID drawing', kind: 'Image', model: 'Vision model', why: 'reads line-work, instrument bubbles and handwriting' },
  { input: 'Scanned page', kind: 'No text layer', model: 'OCR model', why: 'turns a photograph of paper into text that can be searched' },
  { input: 'Long report', kind: 'Analysis', model: 'Reasoning model', why: 'plans the job and holds the whole document in context' },
  { input: 'Hindi or Kannada letter', kind: 'Indic language', model: 'Language model', why: 'drafts correspondence in the script it arrived in' },
];

export default function Landing() {
  const navigate = useNavigate();
  const blocked = useEgress();
  const loaded = MODELS.filter((m) => m.state === 'loaded').length;

  function startGuided() {
    store.startGuided();
    navigate('/login');
  }

  return (
    <Shell>
      {/* ------------------------------ hero ----------------------------- */}
      <section className="hero">
        <div className="container hero-inner">
          <div className="hero-grid">
            <div className="rise">
              <div className="hero-eyebrow">
                <span><Badge tone="onblack">SIH 2026 · PS26117 · MRPL</Badge></span>
                <span>Sovereign On-Premise Agentic AI Workbench</span>
              </div>

              <h1>Private AI for <span className="accent">sensitive</span> industrial work.</h1>
              <p className="kicker">Think. Act. Verify. Deliver. Without sending your data outside.</p>
              <p className="lede">
                Refinery teams do a lot of careful paperwork — inspection reports, approval notes, cost estimates,
                small pieces of code. None of it can be pasted into a public AI tool, because what is inside it is
                not allowed to leave the site. KAVACH is that assistant, running on one server in your own building,
                with no route out to the internet.
              </p>

              <div className="btn-row">
                <Link to="/login" className="btn solid lg">Enter the workbench <ArrowRight size={16} /></Link>
                <button type="button" className="btn onblack lg" onClick={startGuided}>
                  <Play size={15} /> Run the guided demo
                </button>
              </div>

              <div className="hero-facts">
                <div className="hero-fact"><div className="v">{loaded} of {MODELS.length}</div><div className="k">open-weight models resident on the node</div></div>
                <div className="hero-fact"><div className="v">{blocked.length}</div><div className="k">outbound calls refused, 0 permitted</div></div>
                <div className="hero-fact"><div className="v">{KNOWLEDGE.length}</div><div className="k">of your own documents indexed for citation</div></div>
              </div>
            </div>

            <div className="fade" style={{ justifySelf: 'center' }}>
              <HeroPipeline />
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- the spine -------------------------- */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="The whole product in seven words" title="Input, understand, select, act, verify, deliver, audit.">
            Learn this once and every screen in KAVACH makes sense. It is the same sequence whether the job is a
            fourteen-page inspection report or five lines of Python.
          </SectionHead>
          <WorkflowSpine />
        </div>
      </section>

      {/* -------------------------- sovereignty -------------------------- */}
      <section className="section sunken">
        <div className="container">
          <div className="grid wide-first">
            <div>
              <SectionHead eyebrow="Why it is different" title="Your data stays here.">
                Every model runs on a GPU server inside your building. There is no account, no API key and no
                internet connection involved. The prototype proves it rather than claiming it: it intercepts every
                network call the page can make and refuses the ones that would leave.
              </SectionHead>
              <div className="stack tight" style={{ marginBottom: 24 }}>
                <Row n="01" label={<b>Nothing is uploaded</b>} sub="Files are read from a folder on the node. They are never copied off it." />
                <Row n="02" label={<b>Nothing is remembered elsewhere</b>} sub="No vendor sees your prompts, your drawings or your findings." />
                <Row n="03" label={<b>Nothing leaves silently</b>} sub="Every attempt is counted and written to an audit record you can export." />
              </div>
              <Link to="/security" className="linkish">How the boundary is enforced <ArrowRight size={13} style={{ display: 'inline' }} /></Link>
            </div>
            <Panel title="The boundary, drawn" note="Inside is yours. Outside is refused at the line — and the refusal is logged.">
              <BoundaryDiagram refused={blocked.length} permittedLocal={0} />
            </Panel>
          </div>
        </div>
      </section>

      {/* ---------------------------- use cases -------------------------- */}
      <section className="section">
        <div className="container">
          <SectionHead eyebrow="What people actually hand it" title="Four kinds of work, one workbench.">
            None of these are toy examples. Each one is a screen you can open right now and watch run end to end.
          </SectionHead>
          <div className="grid two">
            {USE_CASES.map((u) => (
              <article className="panel" key={u.t}>
                <span className="tc-icon" style={{ color: 'var(--color-burgundy)', display: 'block', marginBottom: 12 }}><u.icon size={20} /></span>
                <h3 style={{ fontSize: 'var(--text-md)', marginBottom: 8 }}>{u.t}</h3>
                <p className="u-muted" style={{ fontSize: 'var(--text-sm)' }}>{u.d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------------------- routing ---------------------------- */}
      <section className="section sunken">
        <div className="container">
          <SectionHead eyebrow="Choosing the right AI" title="You do not pick a model. It picks one, and shows the reason.">
            A scanned page, a drawing and a Python file need three different models. KAVACH looks at what you gave it —
            not at how you phrased the request — and dispatches accordingly.
          </SectionHead>
          <Panel
            title="What goes where"
            note={`${TASK_CLASSES.length} kinds of work, each with a model that suits it and a fallback behind it.`}
            action={<Link to="/app/routing" className="btn ghost sm">See the full picture</Link>}
          >
            <RoutingFlow rows={ROUTE_ROWS} />
          </Panel>
        </div>
      </section>

      {/* ------------------------- agent + deliverables ------------------ */}
      <section className="section">
        <div className="container">
          <div className="grid two">
            <Panel
              title="It works through a job, not one question"
              note={`The inspection run is ${SCENARIOS.inspection.steps.length} steps. You watch every one of them happen.`}
            >
              <ol style={{ margin: 0 }}>
                {SCENARIOS.inspection.steps.slice(0, 7).map((s, i) => (
                  <li key={s.title} style={{ display: 'flex', gap: 12, padding: '7px 0', fontSize: 'var(--text-sm)', borderBottom: '1px solid var(--color-border)' }}>
                    <span className="mono u-accent" style={{ fontSize: 11 }}>{String(i + 1).padStart(2, '0')}</span>
                    <span>{s.title}</span>
                  </li>
                ))}
                <li style={{ padding: '10px 0 0', fontSize: 'var(--text-sm)', color: 'var(--color-muted)' }}>
                  …then it checks its own work, and only then hands anything over.
                </li>
              </ol>
            </Panel>

            <Panel
              title="It hands back a real file"
              note="A Word document, a spreadsheet, a tested Python module — the things you would otherwise have made by hand."
            >
              <Row label={<b>Approval_Note_Unit04_CDU.docx</b>} sub={`${FINDINGS.length} findings, each with its clause and recommended action`} value="Word" />
              <Row label={<b>Inspection_Estimate_Unit04.xlsx</b>} sub="five priced line items, contingency and total, recomputed independently" value="Excel" />
              <Row label={<b>flow_calc_verified.py</b>} sub="7 of 7 tests passing in a container with no network attached" value="Python" />
              <div className="callout" style={{ marginTop: 20 }}>
                <Check size={16} />
                <div>
                  <h4>And it tells you what it was not sure about</h4>
                  <p>One page of the report scored too low to trust, so it is held back and named in the note rather than quietly smoothed over.</p>
                </div>
              </div>
            </Panel>
          </div>
        </div>
      </section>

      {/* -------------------------- architecture ------------------------- */}
      <section className="section sunken">
        <div className="container">
          <div className="grid wide-first">
            <Panel title="How it is put together" note="Six layers, all of them on the same machine. A new model is a row in a registry, not a code path.">
              <ArchitectureStack />
            </Panel>
            <div>
              <SectionHead eyebrow="Built to be extended" title="Model-agnostic by construction.">
                KAVACH does not depend on any one model or vendor. Swapping the reasoning model, or adding an
                Indic-language one, is a configuration change — no screen and no code path moves.
              </SectionHead>
              <div className="grid three" style={{ marginBottom: 20 }}>
                <Stat value={MODELS.length} label="open-weight models in the registry" accent />
                <Stat value={TASK_CLASSES.length} label="kinds of work the router distinguishes" />
                <Stat value={totalDispatches()} label="tasks routed in the last 24 hours" />
              </div>
              <SimNote>Figures come from a fixed demonstration log, identical on every machine</SimNote>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------------------- final CTA -------------------------- */}
      <section className="section dark last">
        <div className="container" style={{ textAlign: 'center' }}>
          <span style={{ color: 'var(--color-warm-2)', display: 'inline-flex', marginBottom: 16 }}><Lock size={24} /></span>
          <h2 style={{ fontSize: 'var(--text-2xl)', marginBottom: 12 }}>See it run, end to end, in about four minutes.</h2>
          <p style={{ margin: '0 auto 28px', maxWidth: '54ch' }}>
            Sign in with a demonstration account and watch a real document turn into a signed-off draft — with a
            live count of every outbound call that was refused along the way.
          </p>
          <div className="btn-row" style={{ justifyContent: 'center' }}>
            <Link to="/login" className="btn solid lg">Enter the workbench <ArrowRight size={16} /></Link>
            <Link to="/how-it-works" className="btn onblack lg">See how KAVACH works</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
