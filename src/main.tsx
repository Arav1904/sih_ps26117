import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { App } from './App';
import { egressGuard } from './services/networkPolicy';
import { auth } from './services/auth';
import { store } from './state/store';
import './styles/index.css';

/* Order matters. The egress guard replaces the document's network
   primitives before React mounts, so nothing the application does
   afterwards can reach the network without passing the policy. */
egressGuard.install();
auth.restore();
store.boot();

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <HashRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <App />
    </HashRouter>
  </StrictMode>,
);
