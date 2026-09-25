import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';

export default function NotFound() {
  return (
    <Shell>
      <div className="container narrow section">
        <div className="eyebrow">404</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 12 }}>That screen does not exist on this node.</h1>
        <p className="u-muted" style={{ marginBottom: 24 }}>
          The address you followed is not part of KAVACH. Nothing failed — there is simply no page there.
        </p>
        <div className="btn-row">
          <Link to="/" className="btn solid">Back to the start</Link>
          <Link to="/app" className="btn ghost">Open the workbench</Link>
        </div>
      </div>
    </Shell>
  );
}
