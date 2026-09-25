/* ---------------------------------------------------------------
   Diagrams.

   Conceptual visuals — the ones that answer "what is happening?"
   rather than "how many?". All hand-drawn SVG/CSS, all using the
   design tokens directly so they can never drift from the palette.

   Rule kept throughout: no diagram is decoration. Each one answers
   a question a visitor is actually asking at that point on the page.
   --------------------------------------------------------------- */
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { STAGES } from '../data/stages';
import type { StageKey } from '../types';

const BURGUNDY = 'var(--color-burgundy)';
const INK = 'var(--color-ink)';
const RULE = 'var(--color-border)';
const MUTED = 'var(--color-muted)';
const MUTED2 = 'var(--color-muted-2)';
const PAPER2 = 'var(--color-paper-2)';
const mono = { fontFamily: 'var(--font-mono)' } as const;
const head = { fontFamily: 'var(--font-head)', fontWeight: 700 } as const;

/* ========================= WORKFLOW SPINE ========================= */

/** INPUT → UNDERSTAND → SELECT → ACT → VERIFY → DELIVER → AUDIT.
 *  The backbone of the whole product; used on the landing page, the
 *  dashboard and above every agent run. */
export function WorkflowSpine({
  active, reached, onBlack, showPlain = true,
}: { active?: StageKey; reached?: StageKey[]; onBlack?: boolean; showPlain?: boolean }) {
  return (
    <div className={onBlack ? 'spine onblack' : 'spine'} role="list" aria-label="How KAVACH handles a task">
      {STAGES.map((s, i) => {
        const isActive = active === s.key;
        const isDone = reached ? reached.includes(s.key) && !isActive : false;
        return (
          <div
            key={s.key}
            role="listitem"
            className={['spine-step', isActive ? 'on' : '', isDone ? 'done' : ''].filter(Boolean).join(' ')}
          >
            <span className="i">{String(i + 1).padStart(2, '0')}</span>
            <span className="t">{s.label}</span>
            {showPlain ? <span className="d">{s.plain}</span> : null}
          </div>
        );
      })}
    </div>
  );
}

/* ====================== HERO PIPELINE PICTURE ===================== */

const PIPELINE = [
  { t: 'Your file', d: 'report · drawing · code' },
  { t: 'Local AI', d: 'chosen for the job' },
  { t: 'Agent', d: 'works the steps' },
  { t: 'Verification', d: 'checks its own answer' },
  { t: 'Deliverable', d: 'a real file back' },
];

/** The 20-second picture: what happens to a file you hand KAVACH,
 *  and the boundary it never crosses. */
export function HeroPipeline() {
  const [lit, setLit] = useState(-1);
  const reduce = usePrefersReducedMotion();

  useEffect(() => {
    if (reduce) { setLit(PIPELINE.length - 1); return; }
    let i = -1;
    const t = window.setInterval(() => {
      i = (i + 1) % (PIPELINE.length + 2);
      setLit(i);
    }, 1100);
    return () => window.clearInterval(t);
  }, [reduce]);

  return (
    <svg viewBox="0 0 520 330" width="100%" role="img" aria-label="A file stays inside the building: local AI, agent, verification, deliverable" style={{ maxWidth: 560 }}>
      <title>What happens to a file you hand to KAVACH</title>

      {/* the boundary */}
      <rect x="6" y="34" width="508" height="252" rx="10" fill="none" stroke="rgba(255,255,255,.22)" strokeDasharray="6 5" />
      <text x="20" y="26" fontSize="11" fill="rgba(255,255,255,.62)" letterSpacing="1.6" {...mono}>YOUR BUILDING — ONE GPU SERVER</text>

      {/* outside world */}
      <g opacity="0.85">
        <text x="514" y="308" fontSize="11" fill="rgba(255,255,255,.4)" textAnchor="end" {...mono}>PUBLIC INTERNET · NO ROUTE OUT</text>
        <line x1="6" y1="296" x2="514" y2="296" stroke="rgba(255,255,255,.14)" />
      </g>

      {PIPELINE.map((p, i) => {
        const y = 52 + i * 46;
        const on = lit === i;
        return (
          <g key={p.t}>
            <rect
              x="28" y={y} width="330" height="36" rx="6"
              fill={on ? 'rgba(220,88,109,.16)' : 'rgba(255,255,255,.045)'}
              stroke={on ? 'var(--color-warm-2)' : 'rgba(255,255,255,.16)'}
              style={{ transition: 'fill .4s ease, stroke .4s ease' }}
            />
            <text x="44" y={y + 16} fontSize="13" fill="#fff" {...head}>{p.t}</text>
            <text x="44" y={y + 29} fontSize="11" fill="rgba(255,255,255,.52)" {...mono}>{p.d}</text>
            {i < PIPELINE.length - 1 ? (
              <path d={`M193 ${y + 36} v10`} stroke={on ? 'var(--color-warm-2)' : 'rgba(255,255,255,.2)'} strokeWidth="1.4" />
            ) : null}
            <circle cx="372" cy={y + 18} r="3" fill={on ? 'var(--color-warm-2)' : 'rgba(255,255,255,.22)'} />
          </g>
        );
      })}

      {/* audit rail on the right */}
      <line x1="372" y1="66" x2="372" y2="256" stroke="rgba(255,255,255,.18)" />
      <text x="386" y="150" fontSize="11" fill="rgba(255,255,255,.55)" {...mono}>AUDIT</text>
      <text x="386" y="164" fontSize="11" fill="rgba(255,255,255,.35)" {...mono}>every</text>
      <text x="386" y="177" fontSize="11" fill="rgba(255,255,255,.35)" {...mono}>step</text>
      <text x="386" y="190" fontSize="11" fill="rgba(255,255,255,.35)" {...mono}>logged</text>

      {/* refused attempt */}
      <g opacity={lit >= PIPELINE.length ? 1 : 0.28} style={{ transition: 'opacity .4s ease' }}>
        <path d="M430 270 L470 300" stroke="var(--color-burgundy)" strokeWidth="1.6" strokeDasharray="4 3" />
        <circle cx="472" cy="302" r="9" fill="none" stroke="var(--color-burgundy)" strokeWidth="1.6" />
        <path d="M468 298 l8 8 M476 298 l-8 8" stroke="var(--color-burgundy)" strokeWidth="1.6" />
      </g>
    </svg>
  );
}

/* ======================= NETWORK BOUNDARY ======================== */

/** "Your data stays here." One picture, no jargon: what is inside the
 *  boundary, what is outside it, and what happens at the line. */
export function BoundaryDiagram({ refused, permittedLocal }: { refused: number; permittedLocal: number }) {
  const inside = [
    { t: 'Your files', d: 'reports, drawings, code' },
    { t: 'Local models', d: '7 open-weight models on the GPU' },
    { t: 'Local knowledge', d: 'your own SOPs and standards' },
    { t: 'Local artifacts', d: 'the files KAVACH gives back' },
  ];
  return (
    <div className="chart-scroll">
      <svg viewBox="0 0 640 340" width="100%" role="img" aria-label="Data boundary: local services inside, public internet outside and blocked">
        <title>What is inside the boundary, and what is refused at it</title>

        {/* inside */}
        <rect x="8" y="30" width="384" height="286" rx="10" fill={PAPER2} stroke={INK} strokeWidth="1.4" />
        <text x="24" y="22" fontSize="11" fill={INK} letterSpacing="1.6" {...mono}>INSIDE YOUR BUILDING</text>

        <rect x="28" y="50" width="344" height="42" rx="6" fill="var(--color-surface)" stroke={BURGUNDY} />
        <text x="44" y="68" fontSize="13" fill={BURGUNDY} {...head}>KAVACH node — MRPL-GPU-01</text>
        <text x="44" y="83" fontSize="11" fill={MUTED} {...mono}>one server · no route out · no account · no API key</text>

        {inside.map((b, i) => (
          <g key={b.t}>
            <rect x="28" y={106 + i * 50} width="344" height="40" rx="6" fill="var(--color-surface)" stroke={RULE} />
            <text x="44" y={123 + i * 50} fontSize="12.5" fill={INK} {...head}>{b.t}</text>
            <text x="44" y={137 + i * 50} fontSize="11" fill={MUTED} {...mono}>{b.d}</text>
            <path d={`M200 ${146 + i * 50} v4`} stroke={RULE} />
          </g>
        ))}

        <text x="28" y="308" fontSize="11" fill={MUTED} {...mono}>{permittedLocal} local request{permittedLocal === 1 ? '' : 's'} permitted this session</text>

        {/* the line */}
        <line x1="408" y1="30" x2="408" y2="316" stroke={BURGUNDY} strokeWidth="2" strokeDasharray="7 5" />
        <text x="416" y="46" fontSize="11" fill={BURGUNDY} letterSpacing="1.4" {...mono}>THE BOUNDARY</text>

        {/* outside */}
        <rect x="432" y="72" width="198" height="60" rx="6" fill="none" stroke={MUTED2} strokeDasharray="4 4" />
        <text x="448" y="97" fontSize="12.5" fill={MUTED} {...head}>Public AI services</text>
        <text x="448" y="113" fontSize="11" fill={MUTED2} {...mono}>never contacted</text>

        <rect x="432" y="148" width="198" height="60" rx="6" fill="none" stroke={MUTED2} strokeDasharray="4 4" />
        <text x="448" y="173" fontSize="12.5" fill={MUTED} {...head}>Telemetry and analytics</text>
        <text x="448" y="189" fontSize="11" fill={MUTED2} {...mono}>never contacted</text>

        {/* refusal */}
        <path d="M392 240 H470" stroke={BURGUNDY} strokeWidth="1.6" strokeDasharray="5 4" />
        <circle cx="408" cy="240" r="11" fill="var(--color-surface)" stroke={BURGUNDY} strokeWidth="1.8" />
        <path d="M403 235 l10 10 M413 235 l-10 10" stroke={BURGUNDY} strokeWidth="1.8" />
        <text x="432" y="236" fontSize="12.5" fill={BURGUNDY} {...head}>{refused} attempt{refused === 1 ? '' : 's'} refused</text>
        <text x="432" y="252" fontSize="11" fill={MUTED} {...mono}>0 permitted · each one logged</text>

        <text x="432" y="292" fontSize="11" fill={MUTED2} {...mono}>Browser-level enforcement in this</text>
        <text x="432" y="306" fontSize="11" fill={MUTED2} {...mono}>demo; OS egress rules in production.</text>
      </svg>
    </div>
  );
}

/* ========================= ROUTING FLOW ========================== */

export interface RouteRow { input: string; kind: string; model: string; why: string }

/** The simple answer to "how does it choose?", before any matrix. */
export function RoutingFlow({ rows }: { rows: RouteRow[] }) {
  return (
    <div>
      {rows.map((r) => (
        <div className="flow-row" key={r.input}>
          <span className="flow-node in">{r.input}</span>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <span className="flow-node">{r.kind}</span>
          <span className="flow-arrow" aria-hidden="true">→</span>
          <span className="flow-node out">{r.model}</span>
          <span className="flow-why">{r.why}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================ DONUT ============================== */

export function Donut({
  slices, total, caption, centerLabel, centerValue,
}: {
  slices: { label: string; value: number; tone?: 'accent' | 'ink' | 'muted' | 'purple' | 'warm' }[];
  total?: number; caption?: string; centerLabel?: string; centerValue?: ReactNode;
}) {
  const sum = (total ?? slices.reduce((n, s) => n + s.value, 0)) || 1;
  const R = 58, C = 2 * Math.PI * R;
  let acc = 0;
  const colour = (t?: string) =>
    t === 'ink' ? INK : t === 'muted' ? MUTED2
      : t === 'purple' ? 'var(--color-purple-soft)'
      : t === 'warm' ? 'var(--color-warm)' : BURGUNDY;

  return (
    <div style={{ display: 'flex', gap: 20, alignItems: 'center', flexWrap: 'wrap' }}>
      <svg viewBox="0 0 150 150" width="150" height="150" role="img" aria-label={caption ?? 'distribution'}>
        <title>{caption ?? 'distribution'}</title>
        <circle cx="75" cy="75" r={R} fill="none" stroke={PAPER2} strokeWidth="15" />
        {slices.map((s, i) => {
          const len = (s.value / sum) * C;
          const el = (
            <circle
              key={s.label} cx="75" cy="75" r={R} fill="none"
              stroke={colour(s.tone)} strokeWidth="15"
              strokeDasharray={`${len} ${C - len}`}
              strokeDashoffset={-acc}
              transform="rotate(-90 75 75)"
              opacity={1 - i * 0.12}
            />
          );
          acc += len;
          return el;
        })}
        {centerValue !== undefined ? (
          <>
            <text x="75" y="72" fontSize="21" textAnchor="middle" fill={INK} {...head}>{centerValue}</text>
            <text x="75" y="88" fontSize="10" textAnchor="middle" fill={MUTED} {...mono}>{centerLabel}</text>
          </>
        ) : null}
      </svg>
      <div style={{ minWidth: 0 }}>
        {slices.map((s, i) => (
          <div key={s.label} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, padding: '3px 0' }}>
            <i style={{ width: 10, height: 10, borderRadius: 2, background: colour(s.tone), opacity: 1 - i * 0.12, flexShrink: 0 }} />
            <span style={{ color: 'var(--color-ink)' }}>{s.label}</span>
            <b style={{ marginLeft: 'auto', fontFamily: 'var(--font-mono)', fontWeight: 500, color: 'var(--color-muted)' }}>{s.value}</b>
          </div>
        ))}
      </div>
    </div>
  );
}

/* =========================== SPARKLINE =========================== */

export function Sparkline({ values, label, height = 46 }: { values: number[]; label: string; height?: number }) {
  const max = Math.max(...values, 1);
  const w = 260;
  const step = values.length > 1 ? w / (values.length - 1) : w;
  const d = values.map((v, i) => `${i === 0 ? 'M' : 'L'}${(i * step).toFixed(1)} ${(height - 4 - (v / max) * (height - 10)).toFixed(1)}`).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${height}`} width="100%" height={height} role="img" aria-label={label} preserveAspectRatio="none">
      <title>{label}</title>
      <path d={`${d} L ${w} ${height} L 0 ${height} Z`} fill={BURGUNDY} fillOpacity="0.08" />
      <path d={d} fill="none" stroke={BURGUNDY} strokeWidth="1.6" />
    </svg>
  );
}

/* ====================== ARCHITECTURE STACK ======================= */

const LAYERS = [
  { t: 'What you see', d: 'the workbench in your browser', tone: 'accent' },
  { t: 'Task router', d: 'reads the input, picks the capability' },
  { t: 'Agent tools', d: 'read, transcribe, retrieve, calculate, run, verify' },
  { t: 'Local models', d: 'open-weight models resident on the GPU' },
  { t: 'Local knowledge', d: 'your procedures, indexed for citation' },
  { t: 'Artifacts and audit', d: 'files on disk, an append-only record' },
];

export function ArchitectureStack() {
  return (
    <div className="stack tight">
      {LAYERS.map((l, i) => (
        <div
          key={l.t}
          className="flow-row"
          style={{
            borderBottom: 'none', padding: 0, display: 'grid',
            gridTemplateColumns: '28px minmax(0,1fr)', gap: 'var(--s-4)', alignItems: 'stretch',
          }}
        >
          <div style={{ display: 'grid', placeItems: 'center', position: 'relative' }}>
            <span
              style={{
                width: 9, height: 9, borderRadius: '50%',
                background: i === 0 ? 'var(--color-burgundy)' : 'var(--color-border-strong)', zIndex: 1,
              }}
            />
            {i < LAYERS.length - 1 ? (
              <span style={{ position: 'absolute', top: '50%', bottom: -14, width: 1, background: 'var(--color-border)' }} />
            ) : null}
          </div>
          <div
            style={{
              border: '1px solid var(--color-border)', borderRadius: 'var(--r-sm)',
              padding: 'var(--s-3) var(--s-4)', background: 'var(--color-surface)',
              borderLeftWidth: i === 0 ? 3 : 1, borderLeftColor: i === 0 ? 'var(--color-burgundy)' : 'var(--color-border)',
            }}
          >
            <div style={{ fontFamily: 'var(--font-head)', fontWeight: 700, fontSize: 14 }}>{l.t}</div>
            <div style={{ fontSize: 13, color: 'var(--color-muted)' }}>{l.d}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ====================== DOCUMENT SCAN VISUAL ===================== */

/** A page being read: the scan line sweeps once, then the regions
 *  it found stay on screen with their confidence. */
export function ScanAnimation({ running }: { running: boolean }) {
  const reduce = usePrefersReducedMotion();
  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: 220, aspectRatio: '3 / 4', border: '1px solid var(--color-border)', background: '#FBFAF9', overflow: 'hidden', borderRadius: 'var(--r-sm)' }}>
      {[14, 30, 46, 62, 74].map((y, i) => (
        <span key={y} style={{ position: 'absolute', left: '10%', top: `${y}%`, width: `${70 - i * 6}%`, height: 5, background: 'var(--color-border)', borderRadius: 2 }} />
      ))}
      {running && !reduce ? (
        <span
          aria-hidden="true"
          style={{
            position: 'absolute', left: 0, right: 0, height: '22%',
            background: 'linear-gradient(180deg, rgba(109,0,26,0), rgba(109,0,26,.16), rgba(109,0,26,0))',
            borderTop: '1px solid var(--color-burgundy)',
            animation: 'kv-sweep 1.8s var(--ease-in-out) infinite',
          }}
        />
      ) : null}
    </div>
  );
}

/* ------------------------------ hook ----------------------------- */

export function usePrefersReducedMotion(): boolean {
  const [reduce, setReduce] = useState(false);
  const mql = useRef<MediaQueryList | null>(null);
  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    mql.current = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduce(mql.current.matches);
    const fn = (e: MediaQueryListEvent) => setReduce(e.matches);
    mql.current.addEventListener?.('change', fn);
    return () => mql.current?.removeEventListener?.('change', fn);
  }, []);
  return reduce;
}
