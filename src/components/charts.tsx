/* ---------------------------------------------------------------
   Charts.

   Hand-drawn SVG so the figures come straight from the arrays the
   surrounding prose reads. No chart library, no CDN, nothing to
   fetch — which matters for an air-gapped deployment.

   Palette is the console surface only: burgundy for the measured
   quantity, ink for axes, rules for the grid.
   --------------------------------------------------------------- */

const ACCENT = '#6D001A';
const INK = '#131110';
const RULE = '#DEDAD6';
const SEC = '#66605D';
const SEC2 = '#928C88';

const mono = { fontFamily: "'JetBrains Mono', monospace" } as const;

/* ------------------------------ bars ----------------------------- */

export interface BarDatum { label: string; value: number; note?: string; accent?: boolean }

export function BarRows({ data, unit, title }: { data: BarDatum[]; unit: string; title: string }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const rowH = 34;
  const h = data.length * rowH + 8;
  return (
    <svg viewBox={`0 0 560 ${h}`} width="100%" role="img" aria-label={title} style={{ overflow: 'visible' }}>
      <title>{title}</title>
      {data.map((d, i) => {
        const y = i * rowH + 4;
        const w = (d.value / max) * 292;
        return (
          <g key={d.label}>
            <text x={0} y={y + 12} fontSize={12} fill={INK} {...mono}>{d.label}</text>
            {d.note ? <text x={0} y={y + 26} fontSize={11} fill={SEC} {...mono}>{d.note}</text> : null}
            <rect x={246} y={y + 3} width={292} height={11} fill="#F0ECE9" />
            <rect x={246} y={y + 3} width={Math.max(w, 2)} height={11} fill={d.accent === false ? SEC2 : ACCENT} />
            <text x={246} y={y + 27} fontSize={11} fill={SEC} {...mono}>
              {d.value} {unit}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ---------------------------- histogram -------------------------- */

export function Histogram({ buckets, title, xLabel }: { buckets: number[]; title: string; xLabel: string }) {
  const max = Math.max(...buckets, 1);
  const w = 560, h = 132, pad = 22;
  const bw = (w - pad) / buckets.length;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={title}>
      <title>{title}</title>
      {[0, 0.5, 1].map((f) => (
        <g key={f}>
          <line x1={pad} x2={w} y1={h - 26 - f * 82} y2={h - 26 - f * 82} stroke={RULE} />
          <text x={0} y={h - 22 - f * 82} fontSize={11} fill={SEC2} {...mono}>{Math.round(max * f)}</text>
        </g>
      ))}
      {buckets.map((v, i) => (
        <rect key={i} x={pad + i * bw + 1} y={h - 26 - (v / max) * 82} width={bw - 2} height={(v / max) * 82} fill={ACCENT} />
      ))}
      <text x={pad} y={h - 8} fontSize={11} fill={SEC} {...mono}>{xLabel}</text>
    </svg>
  );
}

/* ----------------------------- matrix ---------------------------- */

export function Matrix({
  rows, cols, cell, title,
}: { rows: { key: string; label: string }[]; cols: { key: string; label: string }[]; cell: (r: string, c: string) => number; title: string }) {
  const max = Math.max(...rows.flatMap((r) => cols.map((c) => cell(r.key, c.key))), 1);
  const cw = 78, ch = 34, left = 188, top = 46;
  const w = left + cols.length * cw;
  const h = top + rows.length * ch + 6;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={title}>
      <title>{title}</title>
      {cols.map((c, j) => (
        <text key={c.key} x={left + j * cw + cw / 2} y={top - 26} fontSize={11} fill={SEC} textAnchor="middle" {...mono}>
          {c.label.split(' ').map((word, k) => (
            <tspan key={k} x={left + j * cw + cw / 2} dy={k === 0 ? 0 : 12}>{word}</tspan>
          ))}
        </text>
      ))}
      {rows.map((r, i) => (
        <g key={r.key}>
          <text x={0} y={top + i * ch + 21} fontSize={12} fill={INK} {...mono}>{r.label}</text>
          {cols.map((c, j) => {
            const v = cell(r.key, c.key);
            const x = left + j * cw, y = top + i * ch + 4;
            return (
              <g key={c.key}>
                <rect x={x + 1} y={y} width={cw - 3} height={ch - 8} fill={v ? ACCENT : '#F0ECE9'} fillOpacity={v ? 0.16 + (v / max) * 0.84 : 1} />
                <text x={x + cw / 2 - 1} y={y + 17} fontSize={11.5} textAnchor="middle" fill={v / max > 0.55 ? '#fff' : v ? ACCENT : SEC2} {...mono}>
                  {v || '·'}
                </text>
              </g>
            );
          })}
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------- gantt ----------------------------- */

export interface GanttStep { title: string; tool: string; durationMs: number; state: 'pending' | 'active' | 'done' | 'attention' }

export function Gantt({ steps, title }: { steps: GanttStep[]; title: string }) {
  const total = steps.reduce((n, s) => n + s.durationMs, 0) || 1;
  const rowH = 27, left = 208, w = 560;
  const track = w - left;
  let acc = 0;
  const h = steps.length * rowH + 26;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={title}>
      <title>{title}</title>
      {[0, 0.25, 0.5, 0.75, 1].map((f) => (
        <g key={f}>
          <line x1={left + f * track} x2={left + f * track} y1={16} y2={steps.length * rowH + 16} stroke={RULE} />
          <text x={left + f * track} y={10} fontSize={11} fill={SEC2} textAnchor={f === 1 ? 'end' : 'middle'} {...mono}>
            {(total * f / 1000).toFixed(1)}s
          </text>
        </g>
      ))}
      {steps.map((s, i) => {
        const x = left + (acc / total) * track;
        const bw = Math.max((s.durationMs / total) * track, 3);
        acc += s.durationMs;
        const y = i * rowH + 20;
        const pending = s.state === 'pending';
        const fill = s.state === 'attention' ? ACCENT : pending ? '#E4E0DC' : s.state === 'active' ? ACCENT : INK;
        return (
          <g key={i}>
            <text x={0} y={y + 11} fontSize={11.5} fill={pending ? SEC2 : INK} {...mono}>
              {s.title.length > 27 ? s.title.slice(0, 26) + '…' : s.title}
            </text>
            <rect x={x} y={y + 2} width={bw} height={11} fill={fill} fillOpacity={s.state === 'active' ? 0.55 : 1} />
            {s.state === 'attention' ? <rect x={x} y={y + 2} width={bw} height={11} fill="none" stroke={ACCENT} /> : null}
          </g>
        );
      })}
      <text x={0} y={steps.length * rowH + 34} fontSize={11} fill={SEC} {...mono}>
        wall-clock {(total / 1000).toFixed(1)}s · bar width is that step's share of the run
      </text>
    </svg>
  );
}

/* -------------------------- confidence --------------------------- */

export function ConfidenceChart({
  points, threshold, title,
}: { points: { label: string; value: number; engine: string }[]; threshold: number; title: string }) {
  const w = 560, h = 178, left = 34, base = h - 40, top = 16;
  const bw = (w - left) / points.length;
  const yOf = (v: number) => base - ((v - 0.3) / 0.7) * (base - top);
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={title}>
      <title>{title}</title>
      {[0.4, 0.6, 0.8, 1].map((t) => (
        <g key={t}>
          <line x1={left} x2={w} y1={yOf(t)} y2={yOf(t)} stroke={RULE} />
          <text x={0} y={yOf(t) + 4} fontSize={11} fill={SEC2} {...mono}>{t.toFixed(1)}</text>
        </g>
      ))}
      {points.map((p, i) => {
        const held = p.value < threshold;
        const x = left + i * bw + bw * 0.22;
        const bwid = bw * 0.56;
        return (
          <g key={p.label}>
            <rect x={x} y={yOf(p.value)} width={bwid} height={base - yOf(p.value)} fill={ACCENT} fillOpacity={held ? 0.28 : 1} />
            {held ? <rect x={x} y={yOf(p.value)} width={bwid} height={base - yOf(p.value)} fill="none" stroke={ACCENT} strokeDasharray="3 2" /> : null}
            <text x={x + bwid / 2} y={yOf(p.value) - 6} fontSize={11} fill={held ? ACCENT : INK} textAnchor="middle" {...mono}>
              {p.value.toFixed(2)}
            </text>
            <text x={x + bwid / 2} y={base + 14} fontSize={11} fill={SEC} textAnchor="middle" {...mono}>{p.label}</text>
            <text x={x + bwid / 2} y={base + 27} fontSize={11} fill={SEC2} textAnchor="middle" {...mono}>{p.engine}</text>
          </g>
        );
      })}
      <line x1={left} x2={w} y1={yOf(threshold)} y2={yOf(threshold)} stroke={ACCENT} strokeDasharray="5 3" />
      <text x={w} y={yOf(threshold) - 6} fontSize={11} fill={ACCENT} textAnchor="end" {...mono}>
        release threshold {threshold.toFixed(2)}
      </text>
    </svg>
  );
}

/* ---------------------------- egress ----------------------------- */

export function EgressChart({
  refused, elapsedMs, title,
}: { refused: number[]; elapsedMs: number; title: string }) {
  const w = 560, h = 116, base = h - 24, top = 14, left = 26;
  const span = Math.max(elapsedMs, 20000);
  const max = Math.max(refused.length, 4);
  const pts: [number, number][] = [[left, base]];
  refused.forEach((t, i) => {
    const x = left + Math.min(1, t / span) * (w - left);
    const y = base - ((i + 1) / max) * (base - top);
    pts.push([x, base - (i / max) * (base - top)], [x, y]);
  });
  pts.push([w, pts[pts.length - 1]![1]]);
  const path = pts.map((p, i) => (i === 0 ? 'M' : 'L') + p[0].toFixed(1) + ' ' + p[1].toFixed(1)).join(' ');
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label={title}>
      <title>{title}</title>
      <line x1={left} x2={w} y1={base} y2={base} stroke={RULE} />
      <line x1={left} x2={w} y1={top} y2={top} stroke={RULE} />
      <text x={0} y={top + 4} fontSize={11} fill={SEC2} {...mono}>{max}</text>
      <text x={0} y={base + 4} fontSize={11} fill={SEC2} {...mono}>0</text>
      <path d={`${path} L ${w} ${base} Z`} fill={ACCENT} fillOpacity={0.1} />
      <path d={path} fill="none" stroke={ACCENT} strokeWidth={1.6} />
      <text x={left} y={h - 6} fontSize={11} fill={SEC} {...mono}>
        outbound attempts refused, this session · {(elapsedMs / 1000).toFixed(0)}s elapsed
      </text>
      <text x={w} y={h - 6} fontSize={11} fill={SEC} textAnchor="end" {...mono}>0 permitted</text>
    </svg>
  );
}

/* ----------------------------- vram ------------------------------ */

export function VramBar({ segments, total }: { segments: { label: string; gb: number }[]; total: number }) {
  const used = segments.reduce((n, s) => n + s.gb, 0);
  const w = 560, h = 60;
  let acc = 0;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" role="img" aria-label="GPU memory committed by loaded models">
      <title>GPU memory committed by loaded models</title>
      <rect x={0} y={16} width={w} height={18} fill="#F0ECE9" />
      {segments.map((s, i) => {
        const x = (acc / total) * w;
        const sw = (s.gb / total) * w;
        acc += s.gb;
        return <rect key={s.label} x={x} y={16} width={Math.max(sw - 1, 1)} height={18} fill={ACCENT} fillOpacity={1 - i * 0.16} />;
      })}
      <text x={0} y={10} fontSize={11} fill={SEC} {...mono}>{used.toFixed(1)} GB committed</text>
      <text x={w} y={10} fontSize={11} fill={SEC2} textAnchor="end" {...mono}>{total} GB on the node</text>
      <text x={0} y={48} fontSize={11} fill={SEC2} {...mono}>
        {segments.map((s) => `${s.label} ${s.gb}`).join('  ·  ')} GB
      </text>
    </svg>
  );
}

/* --------------------------- page scan --------------------------- */

export interface Region { x: number; y: number; w: number; h: number; text: string; conf: number }

/** The scanned page as the OCR service saw it: region boxes drawn on the
 *  page geometry, shaded by the confidence of the transcription inside. */
export function PageScan({
  regions, threshold, selected, onSelect,
}: { regions: Region[]; threshold: number; selected: number | null; onSelect: (i: number | null) => void }) {
  const w = 300, h = 424;
  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" style={{ maxWidth: 300 }} role="img" aria-label="Scanned page with detected regions">
      <title>Scanned page with detected text regions</title>
      <rect x={0.5} y={0.5} width={w - 1} height={h - 1} fill="#FBFAF9" stroke={RULE} />
      {regions.map((r, i) => {
        const on = selected === i;
        const held = r.conf < threshold;
        return (
          <g key={i} onClick={() => onSelect(on ? null : i)} style={{ cursor: 'pointer' }}>
            <rect
              x={(r.x / 100) * w} y={(r.y / 100) * h}
              width={(r.w / 100) * w} height={(r.h / 100) * h}
              fill={ACCENT} fillOpacity={held ? 0.08 : 0.06 + r.conf * 0.16}
              stroke={ACCENT} strokeOpacity={on ? 1 : 0.5}
              strokeWidth={on ? 1.6 : 1}
              strokeDasharray={held ? '4 3' : undefined}
            />
            <text x={(r.x / 100) * w + 4} y={(r.y / 100) * h + 12} fontSize={10} fill={ACCENT} {...mono}>
              {r.conf.toFixed(2)}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
