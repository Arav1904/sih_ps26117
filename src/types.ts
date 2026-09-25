/* Contracts shared by the UI and the service layer. When the FastAPI
   backend replaces the mocks, these types are what it must emit. */

export type Modality = 'text' | 'vision' | 'ocr';
export type ModelState = 'loaded' | 'standby' | 'available';

export interface ModelRecord {
  id: string;
  name: string;
  role: string;
  quant: string;
  vramGb: number;
  context: string;
  state: ModelState;
  modality: Modality;
  tokensPerSec: number;
}

export interface KnowledgeDoc {
  id: string;
  title: string;
  collection: string;
  pages: number;
  passages: number;
  indexed: boolean;
}

export interface Finding {
  ref: string;
  severity: 'high' | 'medium' | 'low';
  tag: string;
  text: string;
  clause: string;
  action: string;
  page: number;
}

export interface RoutingDecision {
  observation: string;
  target: string;
  reason: string;
}

export type StepState = 'pending' | 'active' | 'done' | 'attention';

/* The seven words that carry the whole product. Every agent step
   belongs to exactly one of them, so a visitor who understands the
   spine understands any run they are shown. */
export type StageKey = 'input' | 'understand' | 'select' | 'act' | 'verify' | 'deliver' | 'audit';

export interface Stage {
  key: StageKey;
  label: string;
  plain: string;
}

export interface AgentStep {
  /** plain-language title — this is what a visitor reads */
  title: string;
  /** the local service the step calls */
  tool: string;
  /** which of the seven stages the step belongs to */
  stage: StageKey;
  durationMs: number;
  /** true where the step finished but raised something for a human */
  attention?: boolean;
  /** one sentence answering "why this step?" */
  why: string;
  /** the raw tool output, level 3 of the information model */
  detail: string;
}

export interface Scenario {
  key: ScenarioKey;
  label: string;
  prompt: string;
  inputs: InputFile[];
  routing: RoutingDecision[];
  steps: AgentStep[];
}

export type ScenarioKey = 'inspection' | 'code';

export interface InputFile {
  name: string;
  size: string;
  meta: string;
  kind: 'pdf' | 'image' | 'code' | 'other';
}

export type ArtifactKind = 'docx' | 'xlsx' | 'py';
export type Verification = 'pass' | 'flagged';

export interface Artifact {
  id: string;
  name: string;
  kind: ArtifactKind;
  verification: Verification;
  note: string;
  sources: string;
  createdAt: number;
  runId: string;
}

export interface RunRecord {
  id: string;
  scenario: ScenarioKey;
  label: string;
  startedAt: number;
  finishedAt: number | null;
  stepStates: StepState[];
  toolCalls: { at: number; tool: string; title: string }[];
  artifacts: string[];
}

export type AuditClass = 'session' | 'task' | 'agent' | 'security' | 'artifact';

export interface AuditEvent {
  seq: number;
  at: number;
  cls: AuditClass;
  message: string;
  detail: string;
}

export interface BlockedCall {
  at: number;
  host: string;
  target: string;
  mechanism: 'fetch' | 'xhr' | 'websocket' | 'beacon';
}

/* A scanned page as the OCR service reports it back. */
export interface OcrPage {
  page: number;
  scanned: boolean;
  /** engine-reported page-level confidence after any fallback re-run */
  confidence: number;
  /** the first-pass score, where a fallback engine had to re-run the page */
  firstPass?: number;
  engine: 'surya' | 'tesseract' | 'native';
  regions: { x: number; y: number; w: number; h: number; text: string; conf: number }[];
}
