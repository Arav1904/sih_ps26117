/* One command that proves the build: types, bundle, every route renders
   (signed in and signed out), the agent run completes, the network
   policy allows local and refuses external, the deliverables open, and
   the production build reaches for nothing on the internet. */
import { execSync } from 'node:child_process';
import { mkdirSync, existsSync } from 'node:fs';

const run = (cmd) => { console.log('\n$ ' + cmd); execSync(cmd, { stdio: 'inherit' }); };

mkdirSync('tests/.b', { recursive: true });
mkdirSync('tests/.out', { recursive: true });

run('npx tsc -b --force');
run(`npx esbuild tests/.entry-app.tsx --bundle --format=iife --jsx=automatic --outfile=tests/.b/app.js --define:process.env.NODE_ENV='"development"' --loader:.css=empty --log-level=error`);
run('node tests/smoke.mjs');
run('node tests/behaviour.mjs');
run('npx esbuild tests/.entry.ts --bundle --format=esm --platform=node --outfile=tests/.b/artifact.js --log-level=error');
run('node tests/ooxml-check.mjs');

if (!existsSync('dist/index.html')) run('npx vite build');
run('node tests/offline-check.mjs');

console.log('\nAll checks passed. Deliverables written to tests/.out for inspection.');
