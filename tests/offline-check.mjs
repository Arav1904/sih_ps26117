import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

/* ---------------------------------------------------------------
   Air-gap check.

   The question is not "does the word http appear in the bundle" — it
   is "does the built page FETCH anything from the internet". So:

   · HTML  — every src= and href= must be relative.
   · CSS   — every url() must be relative (this is what caught the
             Google Fonts dependency the earlier build had).
   · JS    — string literals are inspected against an explicit list.
             Anything not on the list fails, so a new external URL
             cannot slip into the bundle unnoticed.
   --------------------------------------------------------------- */

const JS_ALLOWED = [
  { re: /^https:\/\/reactjs\.org\/docs\/error-decoder/, why: 'React error message text — never fetched' },
  { re: /^http:\/\/127\.0\.0\.1:\d+/, why: 'loopback — the local orchestrator, inside the boundary' },
  { re: /^http:\/\/localhost\/?/, why: 'loopback fallback used when parsing a relative URL' },
  { re: /^https:\/\/api\.openai\.com/, why: 'the demonstration probe target — deliberately refused' },
  { re: /^wss?:\/\/telemetry\.example\.net/, why: 'the demonstration probe target — deliberately refused' },
  { re: /^https:\/\/analytics\.example\.com/, why: 'the demonstration probe target — deliberately refused' },
  { re: /^http:\/\/schemas\.openxmlformats\.org/, why: 'OOXML namespace declaration — an identifier, not an address' },
  { re: /^https?:\/\/www\.w3\.org/, why: 'SVG/XML namespace declaration — an identifier, not an address' },
];

const problems = [];

function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) { walk(p); continue; }
    const ext = extname(name);
    if (!['.html', '.css', '.js'].includes(ext)) continue;
    const text = readFileSync(p, 'utf8');

    if (ext === '.html') {
      for (const m of text.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/g)) {
        if (/^https?:\/\//i.test(m[1])) problems.push(`${name}: loads ${m[1]}`);
      }
    }

    if (ext === '.css' || ext === '.js') {
      for (const m of text.matchAll(/url\(\s*["']?(https?:\/\/[^"')]+)/gi)) {
        problems.push(`${name}: css url() fetches ${m[1]}`);
      }
    }

    if (ext === '.js') {
      for (const m of text.matchAll(/(?:https?|wss?):\/\/[^\s"'`)\\]+/g)) {
        const url = m[0];
        if (JS_ALLOWED.some((a) => a.re.test(url))) continue;
        problems.push(`${name}: unexpected URL literal ${url.slice(0, 110)}`);
      }
    }
  }
}

walk('dist');

const unique = [...new Set(problems)];
if (unique.length) {
  console.log('FAIL  the build reaches outside the boundary:');
  for (const h of unique.slice(0, 20)) console.log('      ' + h);
  process.exit(1);
}

console.log('ok    dist/ fetches nothing from the internet');
console.log('      html: no absolute src or href');
console.log('      css:  no external url() — fonts are bundled, not fetched');
console.log(`      js:   every URL literal accounted for (${JS_ALLOWED.length} documented exceptions, none of them fetched)`);
