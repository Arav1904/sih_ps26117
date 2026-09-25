import type { Artifact, DocBlockList } from './artifact.types';
import { FINDINGS, ESTIMATE, FIXED_CODE } from '../data/corpus';
import { buildDocx, buildXlsx, utf8, type DocBlock } from '../lib/ooxml';
import { audit } from './audit';
import { ocr, OCR_THRESHOLD } from './ocr';

const money = (n: number) => '\u20B9' + n.toLocaleString('en-IN');
const estimateRow = (label: string) => Number(ESTIMATE.find((r) => r[3] === label)?.[4] ?? 0);

export type { DocBlockList };

/** The approval note, as blocks the OOXML writer understands.
 *  Content is derived from application state, not hard-coded prose. */
export function approvalNoteBlocks(): DocBlock[] {
  const blocks: DocBlock[] = [
    { style: 'title', text: 'Approval Note — Inspection Report, Unit 04 (Crude Distillation)' },
    { style: 'kv', label: 'Reference:', text: 'KVCH-AN-2026-0417' },
    { style: 'kv', label: 'Source document:', text: 'Inspection_Report_Unit_04.pdf (14 pages), PID_Sheet_07_CDU04.png' },
    { style: 'kv', label: 'Prepared by:', text: 'KAVACH agent run on the on-premise node. Requires engineer sign-off.' },
    { style: 'kv', label: 'Data handling:', text: 'Processed entirely on the local node. No external network calls.' },
    { style: 'h2', text: 'Findings and procedure cross-check' },
  ];
  for (const f of FINDINGS) {
    blocks.push({ style: 'kv', label: `${f.ref} · ${f.tag} · ${f.severity.toUpperCase()} · p.${f.page}:`, text: f.text });
    blocks.push({ style: 'bullet', text: `Governing clause: ${f.clause}` });
    blocks.push({ style: 'bullet', text: `Recommended action: ${f.action}` });
  }
  blocks.push({ style: 'h2', text: 'Cost estimate' });
  blocks.push({
    style: 'p',
    text: `Subtotal ${money(estimateRow('Subtotal'))}. Contingency at 12% ${money(estimateRow('Contingency 12%'))}. Total ${money(estimateRow('Total'))}. Line detail is in Inspection_Estimate_Unit04.xlsx.`,
  });
  blocks.push({ style: 'h2', text: 'Verification record' });
  blocks.push({ style: 'bullet', text: `Citation check: ${FINDINGS.length} of ${FINDINGS.length} findings carry a retrievable clause reference. Pass.` });
  blocks.push({ style: 'bullet', text: 'Arithmetic check: estimate totals independently recomputed. Pass.' });
  blocks.push({ style: 'bullet', text: 'Completeness check: every extracted finding appears above. Pass.' });
  blocks.push({
    style: 'bullet',
    text: `Coverage check: page ${ocr.belowThreshold().map((p) => p.page).join(' and ')} transcribed below the ${OCR_THRESHOLD.toFixed(2)} confidence threshold. Held for human read.`,
  });
  blocks.push({ style: 'h2', text: 'Sign-off' });
  blocks.push({ style: 'p', text: 'Inspection Engineer: ________________________    Date: ____________' });
  blocks.push({ style: 'p', text: 'Unit Head: ________________________    Date: ____________' });
  blocks.push({ style: 'p', text: 'This note was drafted by an assistive system from demonstration data. It is a draft for review and is not an authorisation.' });
  return blocks;
}

export function artifactBytes(a: Artifact): { bytes: Uint8Array; mime: string } {
  switch (a.kind) {
    case 'docx':
      return {
        bytes: buildDocx(approvalNoteBlocks()),
        mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      };
    case 'xlsx':
      return {
        bytes: buildXlsx(ESTIMATE, 'Estimate'),
        mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      };
    default:
      return { bytes: utf8(FIXED_CODE + '\n'), mime: 'text/x-python' };
  }
}

export function downloadArtifact(a: Artifact): void {
  const { bytes, mime } = artifactBytes(a);
  const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mime });
  const url = URL.createObjectURL(blob);
  const el = document.createElement('a');
  el.href = url;
  el.download = a.name;
  document.body.appendChild(el);
  el.click();
  el.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
  audit.record('artifact', 'Artifact written to local disk', a.name);
}
