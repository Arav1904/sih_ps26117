import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Button, Badge, Callout, Modal } from '../components/ui';
import { auth, AuthError, DEMO_ACCOUNTS, DEMO_PASSWORD, ROLE_LABEL } from '../services/auth';
import { useAuth } from '../state/useAuth';
import { Lock, ArrowRight } from '../components/icons';

export default function Login() {
  const user = useAuth();
  const navigate = useNavigate();
  const location = useLocation() as { state?: { from?: string } };
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [showAccounts, setShowAccounts] = useState(false);

  if (user) return <Navigate to={location.state?.from ?? '/app'} replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      auth.login(email, password);
      navigate(location.state?.from ?? '/app', { replace: true });
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Sign-in failed. Try one of the demo accounts.');
    }
  }

  function useAccount(e: string) {
    setEmail(e);
    setPassword(DEMO_PASSWORD);
    setError(null);
    setShowAccounts(false);
  }

  const accountList = (
    <div>
      {DEMO_ACCOUNTS.map((a) => (
        <button key={a.email} type="button" className="demo-account" onClick={() => useAccount(a.email)}>
          <span style={{ minWidth: 0 }}>
            <span className="r" style={{ display: 'block', color: 'var(--color-ink)' }}>{ROLE_LABEL[a.role]}</span>
            <span className="e">{a.email}</span>
          </span>
          <span className="use">Use</span>
        </button>
      ))}
    </div>
  );

  return (
    <Shell footer={false}>
      <div className="auth-wrap">
        <div className="auth-panel">
          <div className="auth-card">
            <div className="eyebrow"><Lock size={13} /> On-premise node MRPL-GPU-01</div>
            <h1>Sign in to the workbench.</h1>
            <p className="sub">This node is not reachable from outside the site. Sign-in here is a demonstration —
              there is no identity provider behind it.</p>

            {error ? <div className="form-error" role="alert">{error}</div> : null}

            <form onSubmit={submit} noValidate>
              <label className="field">
                <span className="field-label" id="email-label">Email</span>
                <input
                  className="input" type="email" value={email} autoComplete="username"
                  onChange={(ev) => setEmail(ev.target.value)} placeholder="engineer@kavach.local"
                  aria-labelledby="email-label" aria-invalid={error ? true : undefined}
                />
              </label>
              <label className="field">
                <span className="field-label" id="pw-label">Password</span>
                <input
                  className="input" type="password" value={password} autoComplete="current-password"
                  onChange={(ev) => setPassword(ev.target.value)} placeholder="Kavach@2026"
                  aria-labelledby="pw-label" aria-invalid={error ? true : undefined}
                />
              </label>
              <Button type="submit" variant="solid" block>Sign in <ArrowRight size={15} /></Button>
            </form>

            {/* The demo-account panel is a sidebar on wide screens and is
                hidden below 900px — so small screens get it here instead,
                rather than being left with no way to find the credentials. */}
            <div className="only-narrow" style={{ marginTop: 'var(--s-5)' }}>
              <Button variant="ghost" block onClick={() => setShowAccounts(true)}>Show the demo accounts</Button>
            </div>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 20 }}>
              No account? <Link to="/signup" className="linkish">Create a local one</Link> — it is stored in this
              browser only.
            </p>
          </div>
        </div>

        <aside className="auth-aside">
          <Badge tone="onblack" style={{ alignSelf: 'flex-start' }}>Demo accounts</Badge>
          <h2 style={{ marginTop: 16 }}>Pick a role and the form fills itself in.</h2>
          <p style={{ fontSize: 'var(--text-sm)', marginBottom: 20 }}>
            Every account uses the password <b style={{ color: '#fff', fontFamily: 'var(--font-mono)' }}>{DEMO_PASSWORD}</b>.
            The role changes what the navigation offers, not what the demo can do.
          </p>
          <div style={{ background: 'var(--color-paper)', borderRadius: 'var(--r-md)', padding: 'var(--s-4)' }}>
            {accountList}
          </div>
          <div style={{ marginTop: 22 }}>
            <Callout tone="neutral" title="Demonstration authentication">
              Sessions live in this browser's local storage. There is no server, no token and no password hashing.
              In deployment this single module is replaced by the site's LDAP or OIDC provider and nothing above it
              changes.
            </Callout>
          </div>
        </aside>
      </div>

      {showAccounts ? (
        <Modal title="Demo accounts" onClose={() => setShowAccounts(false)}>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginBottom: 'var(--s-4)' }}>
            Every account uses the password <b className="mono">{DEMO_PASSWORD}</b>. Pick one and the form fills
            itself in.
          </p>
          {accountList}
        </Modal>
      ) : null}
    </Shell>
  );
}
