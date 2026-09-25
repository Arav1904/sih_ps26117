/* ---------------------------------------------------------------
   Router telemetry.

   Every routing number shown anywhere in the console is aggregated
   from DISPATCHES below — the charts and the prose read the same
   array, so they cannot disagree. The log is generated once, from a
   fixed seed, so a demo shows identical figures on every machine.
   In deployment this array is a query against the dispatch table.
   --------------------------------------------------------------- */

export interface Dispatch {
  at: number;
  taskClass: TaskClassKey;
  modelId: string;
  ms: number;
  fallback: boolean;
}

export type TaskClassKey = 'summary' | 'code' | 'drawing' | 'scan' | 'indic';

export interface TaskClass {
  key: TaskClassKey;
  label: string;
  /* the observable property of the input that makes the router pick */
  trigger: string;
  /* candidate models with the share of dispatches each takes */
  candidates: { modelId: string; share: number; note: string }[];
  baseMs: number;
}

export const TASK_CLASSES: TaskClass[] = [
  {
    key: 'summary', label: 'Document summary and reasoning', baseMs: 5200,
    trigger: 'text-layer document, no images, multi-step instruction',
    candidates: [
      { modelId: 'llama-3.3-70b', share: 0.82, note: 'planning and long-context reading' },
      { modelId: 'deepseek-r1-32b', share: 0.18, note: 'taken when the prompt asks for a worked argument' },
    ],
  },
  {
    key: 'code', label: 'Code comprehension and repair', baseMs: 3100,
    trigger: 'source file attached, or the prompt names a language or a test',
    candidates: [
      { modelId: 'qwen-coder-32b', share: 0.91, note: 'repair, refactor, test authoring' },
      { modelId: 'llama-3.3-70b', share: 0.09, note: 'taken when the change is a design decision, not a defect' },
    ],
  },
  {
    key: 'drawing', label: 'Drawing and photograph reading', baseMs: 4400,
    trigger: 'raster image, or a page with line-work and instrument bubbles',
    candidates: [{ modelId: 'qwen-vl-7b', share: 1, note: 'P&IDs, isometrics, field photographs, mark-up' }],
  },
  {
    key: 'scan', label: 'Scanned page transcription', baseMs: 1900,
    trigger: 'page carries no text layer',
    candidates: [
      { modelId: 'surya-ocr', share: 0.86, note: 'primary transcription' },
      { modelId: 'tesseract', share: 0.14, note: 'fallback when Surya scores below 0.85' },
    ],
  },
  {
    key: 'indic', label: 'Indic-language correspondence', baseMs: 2700,
    trigger: 'Devanagari or Kannada script detected in the input',
    candidates: [{ modelId: 'sarvam-m', share: 1, note: 'Hindi and Kannada correspondence' }],
  },
];

/* Volume per class over the last 24 hours on the demonstration node. */
const VOLUME: Record<TaskClassKey, number> = { summary: 41, code: 27, drawing: 19, scan: 63, indic: 8 };

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* Anchored to a fixed instant so the 24-hour histogram is stable. */
export const WINDOW_END = Date.UTC(2026, 1, 17, 18, 0, 0);
const DAY = 86400000;

export const DISPATCHES: Dispatch[] = (() => {
  const rnd = mulberry32(26117);
  const out: Dispatch[] = [];
  for (const tc of TASK_CLASSES) {
    const n = VOLUME[tc.key];
    for (let i = 0; i < n; i++) {
      const r = rnd();
      let acc = 0;
      let picked = tc.candidates[0]!;
      for (const c of tc.candidates) { acc += c.share; if (r <= acc) { picked = c; break; } }
      out.push({
        at: WINDOW_END - Math.floor(rnd() * DAY),
        taskClass: tc.key,
        modelId: picked.modelId,
        ms: Math.round(tc.baseMs * (0.72 + rnd() * 0.66)),
        fallback: picked !== tc.candidates[0],
      });
    }
  }
  return out.sort((a, b) => a.at - b.at);
})();

export const totalDispatches = (): number => DISPATCHES.length;

export function byModel(): { modelId: string; count: number; meanMs: number }[] {
  const m = new Map<string, { count: number; total: number }>();
  for (const d of DISPATCHES) {
    const e = m.get(d.modelId) ?? { count: 0, total: 0 };
    e.count++; e.total += d.ms;
    m.set(d.modelId, e);
  }
  return [...m.entries()]
    .map(([modelId, e]) => ({ modelId, count: e.count, meanMs: Math.round(e.total / e.count) }))
    .sort((a, b) => b.count - a.count);
}

export function byClass(): { key: TaskClassKey; count: number }[] {
  return TASK_CLASSES.map((tc) => ({ key: tc.key, count: DISPATCHES.filter((d) => d.taskClass === tc.key).length }));
}

/** counts[taskClass][modelId] — the grid behind the routing matrix. */
export function matrix(): Record<string, Record<string, number>> {
  const out: Record<string, Record<string, number>> = {};
  for (const d of DISPATCHES) {
    (out[d.taskClass] ??= {})[d.modelId] = ((out[d.taskClass] ?? {})[d.modelId] ?? 0) + 1;
  }
  return out;
}

/** Dispatches per hour across the 24-hour window, oldest bucket first. */
export function hourly(): number[] {
  const buckets = new Array(24).fill(0) as number[];
  for (const d of DISPATCHES) {
    const h = Math.min(23, Math.max(0, Math.floor((d.at - (WINDOW_END - DAY)) / 3600000)));
    buckets[h]!++;
  }
  return buckets;
}

export const fallbackCount = (): number => DISPATCHES.filter((d) => d.fallback).length;

export const meanLatencyMs = (): number =>
  Math.round(DISPATCHES.reduce((n, d) => n + d.ms, 0) / DISPATCHES.length);

export const classLabel = (k: TaskClassKey): string => TASK_CLASSES.find((t) => t.key === k)!.label;
