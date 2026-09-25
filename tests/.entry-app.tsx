import { createElement } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { App } from '../src/App';
import { egressGuard } from '../src/services/networkPolicy';
import { auth, DEMO_ACCOUNTS, DEMO_PASSWORD } from '../src/services/auth';
import { store } from '../src/state/store';
import { SCENARIOS } from '../src/data/scenarios';
import { audit } from '../src/services/audit';

egressGuard.install();
auth.restore();
store.boot();

(window as unknown as { mount: (el: HTMLElement, path: string) => void }).mount = (el, path) => {
  createRoot(el).render(
    createElement(
      MemoryRouter,
      { initialEntries: [path], future: { v7_startTransition: true, v7_relativeSplatPath: true } },
      createElement(App),
    ),
  );
};

Object.assign(window as unknown as Record<string, unknown>, {
  store, gate: egressGuard, egressGuard, audit, SCENARIOS, auth, DEMO_ACCOUNTS, DEMO_PASSWORD,
});
