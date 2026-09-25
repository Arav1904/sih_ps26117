import { readFileSync } from 'node:fs';
import { JSDOM } from 'jsdom';

const bundle = readFileSync('tests/.b/app.js', 'utf8');
const dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
  url: 'http://localhost/', pretendToBeVisual: true, runScripts: 'outside-only',
});
const errors = [];
dom.window.console.error = (...a) => errors.push(a.join(' '));
dom.window.eval(bundle);
const { store, gate, audit, SCENARIOS, auth, DEMO_PASSWORD, document } = dom.window;

const checks = [];
const check = (name, pass, detail = '') => { checks.push([name, pass, detail]); };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

/* ---------------------------- auth ------------------------------ */
check('signed out by default', auth.current() === null);
let threw = null;
try { auth.login('engineer@kavach.local', 'wrong'); } catch (e) { threw = e; }
check('wrong password refused', threw !== null);
try { auth.login('nobody@kavach.local', DEMO_PASSWORD); threw = null; } catch (e) { threw = e; }
check('unknown account refused', threw !== null);
const user = auth.login('engineer@kavach.local', DEMO_PASSWORD);
check('demo account signs in', user.role === 'engineer', user.email);
check('demo@kavach.local is an alias', auth.login('demo@kavach.local', DEMO_PASSWORD).role === 'engineer');
check('session persists to localStorage', !!dom.window.localStorage.getItem('kavach.session.v1'));

/* --------------------- network policy classification ------------ */
check('loopback is local', gate.classify('http://127.0.0.1:8000/healthz') === 'local');
check('localhost is local', gate.classify('http://localhost:6333/collections') === 'local');
check('unix socket is local', gate.classify('unix:/run/kavach/sandbox.sock') === 'local');
check('same origin is local', gate.classify('/assets/index.js') === 'local');
check('public host is external', gate.classify('https://api.openai.com/v1/chat') === 'external');
check('relative path stays local', gate.classify('not-a-url/asset.js') === 'local');
check('malformed url is refused, not guessed at', gate.classify('http://[') === 'external');

/* ----------------------------- run ------------------------------ */
for (const sc of Object.values(SCENARIOS)) for (const s of sc.steps) s.durationMs = 1;

dom.window.mount(document.getElementById('root'), '/app/run');
await wait(90);

const before = audit.count();
store.start('inspection');
await wait(2400);
const run = store.getSnapshot().run;

check('run reaches a finish time', !!run && run.finishedAt !== null);
check('every step settled', !!run && run.stepStates.every((s) => s === 'done' || s === 'attention'));
check('two attention steps flagged', run?.stepStates.filter((s) => s === 'attention').length === 2,
  String(run?.stepStates.filter((s) => s === 'attention').length));
check('every step carries a stage and a reason',
  SCENARIOS.inspection.steps.every((s) => !!s.stage && !!s.why));
check('two deliverables written', store.getSnapshot().artifacts.length === 2, String(store.getSnapshot().artifacts.length));
check('ledger grew during the run', audit.count() > before + 10, `${before} -> ${audit.count()}`);
check('deliverable text on screen', (document.body.textContent || '').includes('Approval_Note_Unit04_CDU.docx'));

/* --------------------------- egress ----------------------------- */
const blockedBefore = gate.count();
const permittedBefore = gate.permittedCount();
gate.probe();
await wait(80);
check('external calls refused', gate.count() >= blockedBefore + 2, `${blockedBefore} -> ${gate.count()}`);
check('fetch refusal recorded', gate.list().some((b) => b.mechanism === 'fetch'));
check('websocket refusal recorded', gate.list().some((b) => b.mechanism === 'websocket'));
/* jsdom has no sendBeacon, so this arm is only asserted where it exists. */
const hasBeacon = typeof dom.window.navigator.sendBeacon === 'function';
check('beacon refusal recorded', !hasBeacon || gate.list().some((b) => b.mechanism === 'beacon'),
  hasBeacon ? '' : 'sendBeacon absent in jsdom — classification asserted instead');
check('beacon target would be refused', gate.classify('https://analytics.example.com/collect') === 'external');
check('refusals reach the ledger', audit.list().some((e) => e.cls === 'security'));
check('every refusal names a host', gate.list().every((b) => typeof b.host === 'string' && b.host.length > 0));

gate.probeLocal();
await wait(80);
check('local request permitted, not refused', gate.permittedCount() > permittedBefore, `${permittedBefore} -> ${gate.permittedCount()}`);
check('local request did not inflate the refusal count', !gate.list().some((b) => b.host.startsWith('127.0.0.1')));

/* ---------------------------- code run -------------------------- */
store.start('code');
await wait(2200);
check('code run produces one deliverable',
  store.getSnapshot().artifacts.filter((a) => a.kind === 'py').length === 1);

/* ---------------------------- logout ---------------------------- */
store.reset();
auth.logout();
check('logout clears the session', auth.current() === null);
check('logout clears local storage', !dom.window.localStorage.getItem('kavach.session.v1'));
check('logout clears the workspace', store.getSnapshot().artifacts.length === 0);

const real = errors.filter((e) => !/not wrapped in act|ReactDOMTestUtils/.test(e));
check('no console errors', real.length === 0, real[0]?.slice(0, 160) ?? '');

let fail = 0;
for (const [name, pass, detail] of checks) {
  if (!pass) fail++;
  console.log(`${pass ? 'ok  ' : 'FAIL'}  ${name}${detail ? '  (' + detail + ')' : ''}`);
}
console.log(fail ? `\n${fail} check(s) failed` : '\nall behaviour checks pass');
process.exit(fail ? 1 : 0);
