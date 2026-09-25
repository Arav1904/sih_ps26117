import { MODELS } from '../data/corpus';
import { TASK_CLASSES, type TaskClassKey } from '../data/telemetry';

/* The same rule set the router applies to a queued task: look at what the
   input is, not at what the user says they want. Keyword matching stands in
   for the classifier model on the demonstration node; the contract it
   returns is what the real classifier must emit. */
const RULES: { key: TaskClassKey; words: RegExp }[] = [
  { key: 'code', words: /\b(code|python|script|function|test|pytest|bug|refactor|compile|\.py)\b/i },
  { key: 'drawing', words: /\b(drawing|p&id|pid|isometric|sketch|photo|photograph|image|diagram|mark-?up)\b/i },
  { key: 'scan', words: /\b(scan|scanned|ocr|handwritten|handwriting|transcribe|transcription|illegible)\b/i },
  { key: 'indic', words: /\b(hindi|kannada|devanagari|marathi|vernacular)\b/i },
];

export interface Classification {
  key: TaskClassKey;
  label: string;
  modelId: string;
  modelName: string;
  reason: string;
}

export function classify(text: string): Classification {
  const hit = RULES.find((r) => r.words.test(text));
  const tc = TASK_CLASSES.find((t) => t.key === (hit?.key ?? 'summary'))!;
  const cand = tc.candidates[0]!;
  const model = MODELS.find((m) => m.id === cand.modelId)!;
  return { key: tc.key, label: tc.label, modelId: cand.modelId, modelName: model.name, reason: cand.note };
}
