/* ---------------------------------------------------------------
   DEMONSTRATION CORPUS — entirely fictional.
   No MRPL document, drawing, equipment tag, rate or procedure is
   used here. Unit names, tag numbers and clause references are
   invented for the demonstration and labelled as such in the UI.
   --------------------------------------------------------------- */
import type { Finding, KnowledgeDoc, ModelRecord, OcrPage } from '../types';

export const MODELS: ModelRecord[] = [
  { id: 'llama-3.3-70b',   name: 'Llama-3.3-70B-Instruct',    role: 'Reasoning and planning',                quant: 'Q4_K_M', vramGb: 42,  context: '128k', state: 'loaded',    modality: 'text',   tokensPerSec: 31 },
  { id: 'qwen-coder-32b',  name: 'Qwen2.5-Coder-32B',         role: 'Code comprehension and repair',         quant: 'Q5_K_M', vramGb: 24,  context: '64k',  state: 'loaded',    modality: 'text',   tokensPerSec: 48 },
  { id: 'qwen-vl-7b',      name: 'Qwen2.5-VL-7B',             role: 'Drawings, P&IDs, photographs',          quant: 'FP16',   vramGb: 17,  context: '32k',  state: 'loaded',    modality: 'vision', tokensPerSec: 22 },
  { id: 'surya-ocr',       name: 'Surya OCR v0.6',            role: 'Scanned pages and handwriting',         quant: 'FP16',   vramGb: 2.1, context: '—',    state: 'loaded',    modality: 'ocr',    tokensPerSec: 0 },
  { id: 'tesseract',       name: 'Tesseract 5.4',             role: 'OCR fallback for low-confidence pages', quant: 'CPU',    vramGb: 0,   context: '—',    state: 'standby',   modality: 'ocr',    tokensPerSec: 0 },
  { id: 'sarvam-m',        name: 'Sarvam-M',                  role: 'Indic-language correspondence',         quant: 'Q4_K_M', vramGb: 15,  context: '32k',  state: 'available', modality: 'text',   tokensPerSec: 0 },
  { id: 'deepseek-r1-32b', name: 'DeepSeek-R1-Distill-32B',   role: 'Long-form analysis',                    quant: 'Q4_K_M', vramGb: 20,  context: '64k',  state: 'available', modality: 'text',   tokensPerSec: 0 },
];

export const GPU_TOTAL_GB = 96;

export const KNOWLEDGE: KnowledgeDoc[] = [
  { id: 'SOP-MI-114', title: 'Thickness Survey and Retirement Limits',     collection: 'Mechanical Integrity',  pages: 68, passages: 412, indexed: true },
  { id: 'SOP-OP-042', title: 'Heat Exchanger Fouling Thresholds',          collection: 'Operations',            pages: 31, passages: 188, indexed: true },
  { id: 'MOC-PR-009', title: 'Management of Change Procedure',             collection: 'Process Safety',        pages: 44, passages: 243, indexed: true },
  { id: 'SOP-SF-021', title: 'Pressure Relief Device Register Control',    collection: 'Process Safety',        pages: 27, passages: 156, indexed: true },
  { id: 'ENG-STD-07', title: 'Rotating Equipment Seal Standards',          collection: 'Engineering Standards', pages: 52, passages: 301, indexed: true },
  { id: 'ISO-5167-2', title: 'Orifice Plate Flow Measurement (reference)', collection: 'Engineering Standards', pages: 46, passages: 274, indexed: true },
  { id: 'RATE-2026',  title: 'Contractor Rate Schedule 2026',              collection: 'Commercial',            pages: 18, passages: 94,  indexed: false },
];

export const FINDINGS: Finding[] = [
  { ref: 'F-01', severity: 'high',   tag: 'CDU-04-V-102', page: 4,
    text: 'Shell course 3 minimum measured thickness 9.1 mm against a 9.5 mm retirement limit.',
    clause: 'SOP-MI-114 §6.2',
    action: 'Fitness-for-service assessment before the next startup.' },
  { ref: 'F-02', severity: 'medium', tag: 'CDU-04-E-210', page: 6,
    text: 'Shell-side differential pressure 1.8 bar against 1.2 bar design; fouling indicated.',
    clause: 'SOP-OP-042 §4.1',
    action: 'Schedule bundle cleaning at the next turnaround window.' },
  { ref: 'F-03', severity: 'high',   tag: 'PSV-04-22', page: 7,
    text: 'Handwritten annotation on drawing sheet 7 revises set pressure to 14.8 barg. The relief register still shows 15.4 barg.',
    clause: 'MOC-PR-009 §3 · SOP-SF-021 §2.4',
    action: 'Raise a management-of-change request; the register is out of step with the field mark-up.' },
  { ref: 'F-04', severity: 'low',    tag: 'CDU-04-P-31A', page: 11,
    text: 'Mechanical seal weep observed at the inboard face, no measurable leak rate.',
    clause: 'ENG-STD-07 §9',
    action: 'Add to the monitoring round; re-inspect in 30 days.' },
];

export const ESTIMATE: (string | number)[][] = [
  ['Line item', 'Unit', 'Qty', 'Rate (INR)', 'Amount (INR)'],
  ['Scaffolding — V-102 shell course 3', 'lot', 1, 48000, 48000],
  ['UT thickness survey crew (3 technicians)', 'day', 3, 22000, 66000],
  ['E-210 bundle extraction and cleaning', 'lot', 1, 185000, 185000],
  ['PSV-04-22 bench test and recertification', 'each', 1, 34000, 34000],
  ['Fitness-for-service assessment (external)', 'lot', 1, 120000, 120000],
  ['', '', '', 'Subtotal', 453000],
  ['', '', '', 'Contingency 12%', 54360],
  ['', '', '', 'Total', 507360],
];

/* Page-level OCR results for the document viewer. Confidences and region
   boxes are fixed demonstration values, not live model output. */
export const SCANNED_PAGES = 9;

export const OCR_PAGES: OcrPage[] = [
  { page: 4, scanned: true, confidence: 0.96, engine: 'surya', regions: [
    { x: 8,  y: 10, w: 62, h: 5,  text: 'UNIT 04 — CRUDE DISTILLATION — OVERHEAD DRUM V-102', conf: 0.98 },
    { x: 8,  y: 26, w: 84, h: 13, text: 'Shell course 3 — UT grid, 12 points — minimum 9.1 mm', conf: 0.97 },
    { x: 8,  y: 47, w: 54, h: 6,  text: 'Retirement limit per SOP-MI-114: 9.5 mm', conf: 0.95 },
    { x: 8,  y: 61, w: 72, h: 18, text: 'Previous survey 2023: minimum 10.4 mm. Corrosion rate 0.43 mm/yr.', conf: 0.94 },
  ]},
  { page: 6, scanned: true, confidence: 0.89, firstPass: 0.71, engine: 'tesseract', regions: [
    { x: 8,  y: 12, w: 64, h: 6,  text: 'EXCHANGER E-210 — SHELL SIDE dP LOG', conf: 0.88 },
    { x: 8,  y: 29, w: 78, h: 15, text: 'dP trend 1.1 → 1.8 bar over 14 months (design 1.2 bar)', conf: 0.91 },
    { x: 8,  y: 53, w: 62, h: 18, text: 'faded carbon copy — partial transcription only', conf: 0.71 },
  ]},
  { page: 7, scanned: true, confidence: 0.88, engine: 'surya', regions: [
    { x: 6,  y: 8,  w: 88, h: 40, text: 'P&ID sheet 7 — overhead circuit, 3 instrument bubbles detected', conf: 0.93 },
    { x: 52, y: 56, w: 40, h: 10, text: 'handwritten: "set press. revised 14.8 barg — 11/02"', conf: 0.88 },
    { x: 8,  y: 74, w: 34, h: 8,  text: 'PSV-04-22', conf: 0.96 },
  ]},
  { page: 8, scanned: true, confidence: 0.68, firstPass: 0.68, engine: 'tesseract', regions: [
    { x: 8,  y: 16, w: 70, h: 28, text: 'transcription below threshold — page held for human read', conf: 0.41 },
  ]},
];

export const BROKEN_CODE = `def corrected_flow(dp_mbar, rho, beta, d_mm):
    """Orifice flow, ISO 5167. Returns m3/h."""
    E = 1 / (1 - beta ** 4)          # BUG: missing sqrt
    A = 3.14159 * (d_mm / 1000) ** 2 / 4
    return E * A * (2 * dp_mbar / rho) ** 0.5 * 3600   # BUG: mbar never converted to Pa`;

export const FIXED_CODE = `import math


def corrected_flow(dp_mbar, rho, beta, d_mm):
    """Orifice flow rate per ISO 5167-2. Returns volumetric flow in m3/h.

    dp_mbar : differential pressure across the orifice, mbar
    rho     : fluid density at flowing conditions, kg/m3
    beta    : diameter ratio d/D, dimensionless (0 < beta < 1)
    d_mm    : orifice bore diameter, mm
    """
    if not 0 < beta < 1:
        raise ValueError("beta must lie strictly between 0 and 1")
    if rho <= 0:
        raise ValueError("density must be positive")

    dp_pa = dp_mbar * 100.0                      # FIX 1: mbar -> Pa
    E = 1.0 / math.sqrt(1.0 - beta ** 4)         # FIX 2: velocity-of-approach factor
    area = math.pi * (d_mm / 1000.0) ** 2 / 4.0
    return E * area * math.sqrt(2.0 * dp_pa / rho) * 3600.0`;

/* The sandbox test suite, before and after the patch. The counts the
   scenario timeline quotes (2 passed / 5 failed, then 7 passed) are
   derived from this array, not written out separately. */
export interface TestCase { name: string; before: 'pass' | 'fail'; after: 'pass' | 'fail'; note: string }

export const TESTS: TestCase[] = [
  { name: 'test_zero_dp_returns_zero',        before: 'pass', after: 'pass', note: 'zero differential pressure gives zero flow' },
  { name: 'test_returns_float',               before: 'pass', after: 'pass', note: 'return type contract' },
  { name: 'test_reference_case',              before: 'fail', after: 'pass', note: 'ISO 5167-2 worked example — expected 41.7 m3/h, got 4.17' },
  { name: 'test_unit_conversion_mbar_to_pa',  before: 'fail', after: 'pass', note: 'differential pressure must be converted before use' },
  { name: 'test_velocity_of_approach_factor', before: 'fail', after: 'pass', note: 'E = 1/sqrt(1 - beta^4), not 1/(1 - beta^4)' },
  { name: 'test_beta_out_of_range_raises',    before: 'fail', after: 'pass', note: 'beta outside (0,1) must raise, not return a complex result' },
  { name: 'test_negative_density_raises',     before: 'fail', after: 'pass', note: 'non-physical density must raise' },
];

/* Constraints the runner applies to every execution. */
export const SANDBOX_LIMITS: { k: string; v: string }[] = [
  { k: 'Network', v: 'no namespace attached — the container has no interface to use' },
  { k: 'Filesystem', v: 'read-only rootfs, one writable scratch mount at /tmp' },
  { k: 'Memory', v: '2 GiB hard limit, OOM-killed above it' },
  { k: 'CPU', v: '2 cores, 10s wall clock per execution' },
  { k: 'Capabilities', v: 'all dropped, no new privileges, non-root user' },
  { k: 'Lifetime', v: 'container destroyed after the run; nothing persists between executions' },
];
