import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

/* Every route renders, with a signed-in session where the route needs
   one, and with no React console error. */

const PUBLIC = [
  ['/', 'Private AI for'],
  ['/how-it-works', 'One job, carried the whole way'],
  ['/capabilities', 'What KAVACH can actually do'],
  ['/security', 'Your data stays here'],
  ['/login', 'Sign in to the workbench'],
  ['/signup', 'Add yourself to this node'],
  ['/no-such-page', 'does not exist on this node'],
];

const PRIVATE = [
  ['/app', 'What would you like to work on'],
  ['/app/work', 'Everything on this node'],
  ['/app/run', 'Watch it do the whole job'],
  ['/app/documents', 'What the models actually read'],
  ['/app/knowledge', 'Where the answers came from'],
  ['/app/sandbox', 'proved rather than promised'],
  ['/app/routing', 'Nobody picks a model'],
  ['/app/sovereignty', 'Your data stays here'],
  ['/app/audit', 'Everything that happened, in order'],
  ['/app/system', 'The node.'],
  ['/app/night', 'The node after hours'],
  ['/app/archive', 'The source document, page by page'],
];

/* A signed-out visitor is sent to sign-in rather than shown the screen. */
const GUARDED = [['/app', 'Sign in to the workbench'], ['/app/audit', 'Sign in to the workbench']];

const bundle = readFileSync('tests/.b/app.js', 'utf8');
let failures = 0;

async function render(path, { signedIn }) {
  const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
    url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only',
  });
  const errors = [];
  dom.window.console.error = (...a) => errors.push(a.join(' '));
  dom.window.eval(bundle);
  if (signedIn) dom.window.auth.login('engineer@kavach.local', dom.window.DEMO_PASSWORD);
  dom.window.mount(dom.window.document.getElementById('root'), path);
  await new Promise((r) => setTimeout(r, 90));
  const text = dom.window.document.body.textContent || '';
  const svgs = dom.window.document.querySelectorAll('svg').length;
  const real = errors.filter((e) => !/not wrapped in act|ReactDOMTestUtils/.test(e));
  dom.window.close();
  return { text, svgs, real };
}

async function check(label, path, expect, opts) {
  const { text, svgs, real } = await render(path, opts);
  const ok = text.includes(expect);
  if (!ok || real.length) failures++;
  console.log(
    `${ok && !real.length ? 'ok  ' : 'FAIL'}  ${label.padEnd(10)} ${path.padEnd(20)} ${String(text.length).padStart(5)} chars ${String(svgs).padStart(3)} svg`
    + (real.length ? `\n      console.error: ${real[0].slice(0, 220)}` : '')
    + (ok ? '' : `\n      missing: ${expect}`),
  );
}

for (const [p, e] of PUBLIC) await check('public', p, e, { signedIn: false });
for (const [p, e] of PRIVATE) await check('signed-in', p, e, { signedIn: true });
for (const [p, e] of GUARDED) await check('guarded', p, e, { signedIn: false });

console.log(failures ? `\n${failures} route(s) failed` : '\nall routes render clean');
process.exit(failures ? 1 : 0);
