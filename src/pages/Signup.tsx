import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { Button, Callout, Badge } from '../components/ui';
import { auth, AuthError, ROLE_LABEL, type Role } from '../services/auth';
import { useAuth } from '../state/useAuth';
import { ArrowRight } from '../components/icons';

const ROLES: Role[] = ['engineer', 'auditor', 'admin'];

export default function Signup() {
  const user = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('engineer');
  const [error, setError] = useState<string | null>(null);

  if (user) return <Navigate to="/app" replace />;

  function submit(e: FormEvent) {
    e.preventDefault();
    try {
      auth.signup({ name, email, password, role });
      navigate('/app', { replace: true });
    } catch (err) {
      setError(err instanceof AuthError ? err.message : 'Could not create the account.');
    }
  }

  return (
    <Shell footer={false}>
      <div className="auth-wrap">
        <div className="auth-panel">
          <div className="auth-card">
            <div className="eyebrow">Create a local account</div>
            <h1>Add yourself to this node.</h1>
            <p className="sub">The account is written to this browser's local storage and nowhere else.</p>

            {error ? <div className="form-error" role="alert">{error}</div> : null}

            <form onSubmit={submit} noValidate>
              <label className="field">
                <span className="field-label" id="n-l">Name</span>
                <input className="input" value={name} onChange={(e) => setName(e.target.value)} placeholder="A. Sharma" aria-labelledby="n-l" />
              </label>
              <label className="field">
                <span className="field-label" id="e-l">Email</span>
                <input className="input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@kavach.local" aria-labelledby="e-l" />
              </label>
              <label className="field">
                <span className="field-label" id="p-l">Password</span>
                <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="at least 8 characters" aria-labelledby="p-l" />
                <span className="field-hint">Stored in plain text in this browser. Do not reuse a real password.</span>
              </label>
              <fieldset className="field" style={{ border: 0 }}>
                <legend className="field-label">Role</legend>
                <div className="chip-row">
                  {ROLES.map((r) => (
                    <button key={r} type="button" className={role === r ? 'chip on' : 'chip'} onClick={() => setRole(r)} aria-pressed={role === r}>
                      {ROLE_LABEL[r]}
                    </button>
                  ))}
                </div>
              </fieldset>
              <Button type="submit" variant="solid" block>Create account and sign in <ArrowRight size={15} /></Button>
            </form>

            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-muted)', marginTop: 20 }}>
              Already have one? <Link to="/login" className="linkish">Sign in</Link>
            </p>
          </div>
        </div>

        <aside className="auth-aside">
          <Badge tone="onblack" style={{ alignSelf: 'flex-start' }}>Prototype</Badge>
          <h2 style={{ marginTop: 16 }}>This is not enterprise identity.</h2>
          <div style={{ background: 'var(--color-paper)', borderRadius: 'var(--r-md)', padding: 'var(--s-4)' }}>
            <Callout tone="neutral" title="What this actually is">
              A browser-only account list. No server, no hashing, no token, no recovery. It exists so the demo has a
              real sign-in moment and a logout that genuinely clears the workspace. Use the built-in demo accounts
              unless you specifically want to test account creation.
            </Callout>
          </div>
        </aside>
      </div>
    </Shell>
  );
}
