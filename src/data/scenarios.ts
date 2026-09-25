import type { Scenario, ScenarioKey } from '../types';

/* ---------------------------------------------------------------
   The demonstration task classes.

   Adding a third is one entry in this object — no component change,
   no route change, no CSS. That extensibility is part of the product
   claim, so it is kept true.

   Two layers of language per step:
     title + why  → what a visitor reads
     detail       → what the tool actually returned (level 3)
   --------------------------------------------------------------- */

export const SCENARIOS: Record<ScenarioKey, Scenario> = {
  inspection: {
    key: 'inspection',
    label: 'Inspection report review',
    prompt:
      'Review this inspection report, check each finding against the procedure that governs it, and prepare an approval note with a cost estimate.',
    inputs: [
      { name: 'Inspection_Report_Unit_04.pdf', size: '6.4 MB', meta: '14 pages · 9 scanned · 5 native text', kind: 'pdf' },
      { name: 'PID_Sheet_07_CDU04.png', size: '2.1 MB', meta: '1600×1131 · drawing with field mark-up', kind: 'image' },
    ],
    routing: [
      { observation: '9 of 14 pages carry no text layer', target: 'Surya OCR v0.6', reason: 'scanned pages have to be turned into text before anything can read them' },
      { observation: 'A drawing with a pen annotation is attached', target: 'Qwen2.5-VL-7B', reason: 'reads drawings and handwriting, which a text model cannot see at all' },
      { observation: 'Checking findings against procedure takes several steps', target: 'Llama-3.3-70B-Instruct', reason: 'plans the job and reasons over what was retrieved' },
      { observation: 'Every clause has to be quoted, not remembered', target: 'Qdrant local index', reason: 'finds the actual passage in your own procedures' },
    ],
    steps: [
      {
        title: 'Open the files you gave it', tool: 'file.read', stage: 'input', durationMs: 900,
        why: 'Both files are read from a folder on this machine. Nothing is uploaded anywhere.',
        detail: 'Inspection_Report_Unit_04.pdf — 14 pages, 6.4 MB\nPID_Sheet_07_CDU04.png — 1600×1131\nBoth read from /var/kavach/inbox on the local volume.',
      },
      {
        title: 'Work out what is being asked', tool: 'planner', stage: 'understand', durationMs: 800,
        why: 'Before choosing any AI, KAVACH decides what kind of job this is and what you expect back at the end.',
        detail: 'Task class: inspection review and document generation\nDeliverables implied: approval note, cost estimate\nClassification confidence 0.94',
      },
      {
        title: 'Choose the right AI for each part', tool: 'router', stage: 'select', durationMs: 700,
        why: 'A scan, a drawing and a piece of reasoning need three different models. You do not pick — the system does, and it shows the reason.',
        detail: 'Four capabilities engaged. Route accepted — the reason for each is on the Model routing screen.',
      },
      {
        title: 'Turn the scanned pages into text', tool: 'ocr.surya', stage: 'act', durationMs: 2400, attention: true,
        why: 'Nine of the fourteen pages are photographs of paper. They have to be transcribed before anything can be found in them.',
        detail: '9 pages transcribed. Mean character confidence 0.96.\nPages 6 and 8 fell to 0.71 and 0.68, below the 0.85 threshold.\nTesseract fallback re-ran both. Page 8 is still below threshold and is held for a human read.',
      },
      {
        title: 'Read the mark-up on the drawing', tool: 'vision.qwen-vl', stage: 'act', durationMs: 1700,
        why: 'Someone wrote a revised pressure on the drawing by hand. A text-only system would have missed the number that matters most.',
        detail: 'Detected: 1 P&ID sheet, 3 instrument bubbles, 1 handwritten annotation beside PSV-04-22.\nTranscribed annotation: "set press. revised 14.8 barg — 11/02" at confidence 0.88.',
      },
      {
        title: 'Pull out what was found', tool: 'extract', stage: 'act', durationMs: 1300,
        why: 'Each finding is captured with its equipment tag, its measured value and the page it came from, so it can be traced back.',
        detail: '4 findings recovered with equipment tags, measured values and page references.',
      },
      {
        title: 'Find the relevant procedures', tool: 'rag.qdrant', stage: 'act', durationMs: 1100,
        why: 'An answer without a passage behind it is a recollection, not a citation. Every finding gets a real clause from your own documents.',
        detail: '5 passages retrieved from 4 documents.\nSOP-MI-114 §6.2 · SOP-OP-042 §4.1 · MOC-PR-009 §3 · SOP-SF-021 §2.4 · ENG-STD-07 §9',
      },
      {
        title: 'Check each finding against the rules', tool: 'reason.llama', stage: 'act', durationMs: 1800,
        why: 'This is the judgement part: does the measured value actually breach the limit the procedure sets?',
        detail: 'F-01 breaches the retirement limit in SOP-MI-114 §6.2.\nF-03 is a register mismatch: the field mark-up and the relief register disagree by 0.6 barg.',
      },
      {
        title: 'Work out what it will cost', tool: 'sheet.calc', stage: 'act', durationMs: 900,
        why: 'The estimate is arithmetic, so it is computed rather than written by a language model — and then recomputed in the verify step.',
        detail: '5 line items priced against the local rate schedule. Subtotal ₹4,53,000, contingency 12%, total ₹5,07,360.',
      },
      {
        title: 'Write the approval note', tool: 'reason.llama', stage: 'act', durationMs: 1600,
        why: 'The note is assembled from the findings, the clauses and the estimate — the same things you just watched it gather.',
        detail: 'Structured note produced: findings, clause citations, recommended actions, sign-off block.',
      },
      {
        title: 'Check its own work', tool: 'verify', stage: 'verify', durationMs: 1400, attention: true,
        why: 'Four checks run before anything is handed over. Three pass. One does not, and that is why the deliverable is flagged instead of presented as finished.',
        detail: 'Citation check — 4 of 4 findings carry a retrievable clause reference. Pass.\nArithmetic check — estimate totals independently recomputed. Pass.\nCompleteness check — every extracted finding appears in the note. Pass.\nCoverage check — page 8 OCR is below threshold. Flagged, not passed.',
      },
      {
        title: 'Hand you the files', tool: 'file.write', stage: 'deliver', durationMs: 900,
        why: 'A Word document and a spreadsheet, written to disk on this machine. Open them, edit them, sign them.',
        detail: 'Approval_Note_Unit04_CDU.docx\nInspection_Estimate_Unit04.xlsx\nBoth written to the local artifact store.',
      },
    ],
  },

  code: {
    key: 'code',
    label: 'Code repair and verification',
    prompt:
      'This flow calculation is returning values about ten times too low. Find the fault, fix it, test it, and give me the verified version.',
    inputs: [{ name: 'flow_calc.py', size: '1.1 KB', meta: 'Python · 5 lines · internal utility', kind: 'code' }],
    routing: [
      { observation: 'The input is source code with a numerical fault', target: 'Qwen2.5-Coder-32B', reason: 'reads and repairs code' },
      { observation: 'A claimed fix has to be demonstrated, not asserted', target: 'Docker sandbox', reason: 'runs the tests in a container with no network attached' },
      { observation: 'The formula must match a published standard', target: 'Qdrant local index', reason: 'the ISO 5167 reference is held in your own engineering corpus' },
    ],
    steps: [
      {
        title: 'Open the file you gave it', tool: 'file.read', stage: 'input', durationMs: 700,
        why: 'Read from a folder on this machine. The code is never sent to a hosted coding assistant.',
        detail: 'flow_calc.py — 1.1 KB, read from /var/kavach/inbox.',
      },
      {
        title: 'Work out what is being asked', tool: 'planner', stage: 'understand', durationMs: 700,
        why: 'The job is diagnose, repair, prove. That third word is what makes it different from a chatbot answer.',
        detail: 'Task class: defect diagnosis, repair and verification\nDeliverable implied: corrected module\nClassification confidence 0.91',
      },
      {
        title: 'Choose the right AI for the job', tool: 'router', stage: 'select', durationMs: 600,
        why: 'Source code goes to the coding model, not the general one — and the sandbox is engaged up front because the fix will have to be proved.',
        detail: 'Coding model and sandbox engaged. Route accepted.',
      },
      {
        title: 'Run the existing tests to see the failure', tool: 'sandbox.exec', stage: 'act', durationMs: 1600, attention: true,
        why: 'It looks at the failure itself rather than taking your word for it. The size of the error is the first clue.',
        detail: 'python -m pytest tests/test_flow.py\n2 passed, 5 failed\ntest_reference_case: expected 41.7 m3/h, got 4.17 m3/h\nThe ratio is almost exactly 10, which points at a unit conversion.',
      },
      {
        title: 'Find the fault', tool: 'reason.qwen-coder', stage: 'act', durationMs: 1500,
        why: 'Two separate mistakes, one symptom. Neither is a typo — both are the kind that passes review.',
        detail: 'Two defects found.\n1. dp_mbar is used as though it were pascals. 1 mbar = 100 Pa, so the result is low by sqrt(100) = 10.\n2. The velocity-of-approach factor omits its square root: E = 1/sqrt(1 - beta^4).',
      },
      {
        title: 'Check the formula against the standard', tool: 'rag.qdrant', stage: 'act', durationMs: 900,
        why: 'The corrected formula is matched against the published reference held in your own corpus, not recalled from memory.',
        detail: 'ISO 5167-2 §5.1 retrieved from the engineering corpus. Both corrections match the published form.',
      },
      {
        title: 'Apply the fix', tool: 'code.edit', stage: 'act', durationMs: 1000,
        why: 'Minimal edit: the unit conversion, the corrected factor, two guards against nonsense inputs, and a docstring.',
        detail: '3 lines changed, 8 added: unit conversion, corrected factor, input guards, docstring.',
      },
      {
        title: 'Run the tests again', tool: 'sandbox.exec', stage: 'act', durationMs: 1800,
        why: 'The claim is not that the agent believes it is fixed. It is that the suite ran and the runner reported it.',
        detail: 'python -m pytest tests/test_flow.py\n7 passed, 0 failed — 0.42 s\ntest_reference_case: 41.7 m3/h, matching the standard\'s worked example.',
      },
      {
        title: 'Check its own work', tool: 'verify', stage: 'verify', durationMs: 1100,
        why: 'All four checks pass here, so nothing is held. That is the contrast with the inspection run, where one check failed.',
        detail: 'Test suite — 7 of 7 pass.\nReference case — matches the ISO 5167-2 worked example to 3 significant figures.\nStatic check — ruff clean, no new imports beyond math.\nSandbox — executed with no network namespace attached.',
      },
      {
        title: 'Hand you the file', tool: 'file.write', stage: 'deliver', durationMs: 700,
        why: 'A Python module you can drop straight back into the repository it came from.',
        detail: 'flow_calc_verified.py written to the local artifact store.',
      },
    ],
  },
};
