import { Routes, Route, Navigate } from 'react-router-dom';
import { RequireAuth } from './components/RequireAuth';
import { GuidedDemo } from './components/GuidedDemo';
import { ErrorBoundary } from './components/ErrorBoundary';

import Landing from './pages/Landing';
import HowItWorks from './pages/HowItWorks';
import Capabilities from './pages/Capabilities';
import SecurityPublic from './pages/SecurityPublic';
import Login from './pages/Login';
import Signup from './pages/Signup';
import NotFound from './pages/NotFound';

import Dashboard from './pages/Dashboard';
import Work from './pages/Work';
import AgentRun from './pages/AgentRun';
import DocumentTask from './pages/DocumentTask';
import Knowledge from './pages/Knowledge';
import Sandbox from './pages/Sandbox';
import Routing from './pages/Routing';
import Sovereignty from './pages/Sovereignty';
import Ledger from './pages/Ledger';
import System from './pages/System';
import NightOps from './pages/NightOps';
import Archive from './pages/Archive';

/* Routes are eagerly imported rather than lazy-loaded. Two reasons:
   the whole bundle is small, and a single self-contained chunk is what
   lets dist/index.html open from a USB stick on an air-gapped machine
   with no server to fetch a second chunk from. */

const guard = (el: JSX.Element) => <RequireAuth>{el}</RequireAuth>;

export function App() {
  return (
    <ErrorBoundary>
      <GuidedDemo />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/capabilities" element={<Capabilities />} />
        <Route path="/security" element={<SecurityPublic />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        <Route path="/app" element={guard(<Dashboard />)} />
        <Route path="/app/work" element={guard(<Work />)} />
        <Route path="/app/run" element={guard(<AgentRun />)} />
        <Route path="/app/documents" element={guard(<DocumentTask />)} />
        <Route path="/app/knowledge" element={guard(<Knowledge />)} />
        <Route path="/app/sandbox" element={guard(<Sandbox />)} />
        <Route path="/app/routing" element={guard(<Routing />)} />
        <Route path="/app/sovereignty" element={guard(<Sovereignty />)} />
        <Route path="/app/audit" element={guard(<Ledger />)} />
        <Route path="/app/system" element={guard(<System />)} />
        <Route path="/app/night" element={guard(<NightOps />)} />
        <Route path="/app/archive" element={guard(<Archive />)} />

        {/* addresses from the previous build keep working */}
        <Route path="/console" element={<Navigate to="/app" replace />} />
        <Route path="/console/sovereignty" element={<Navigate to="/app/sovereignty" replace />} />
        <Route path="/console/routing" element={<Navigate to="/app/routing" replace />} />
        <Route path="/console/run" element={<Navigate to="/app/run" replace />} />
        <Route path="/console/sandbox" element={<Navigate to="/app/sandbox" replace />} />
        <Route path="/console/document" element={<Navigate to="/app/documents" replace />} />
        <Route path="/console/ledger" element={<Navigate to="/app/audit" replace />} />
        <Route path="/archive" element={<Navigate to="/app/archive" replace />} />
        <Route path="/night" element={<Navigate to="/app/night" replace />} />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
