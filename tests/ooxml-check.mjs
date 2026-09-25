import { writeFileSync } from 'node:fs';
import { approvalNoteBlocks } from '../tests/.b/artifact.js';
import { buildDocx, buildXlsx } from '../tests/.b/artifact.js';
import { ESTIMATE } from '../tests/.b/artifact.js';
writeFileSync('tests/.out/Approval_Note.docx', buildDocx(approvalNoteBlocks()));
writeFileSync('tests/.out/Estimate.xlsx', buildXlsx(ESTIMATE, 'Estimate'));
console.log('written');
