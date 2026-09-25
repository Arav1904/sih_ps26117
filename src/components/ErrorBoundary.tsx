import { Component, type ErrorInfo, type ReactNode } from 'react';

/* A screen that throws should not take the product down with it, and a
   visitor should never be shown a stack trace. They get a sentence and
   a way out; the detail is one click down for whoever is debugging. */
export class ErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state: { error: Error | null } = { error: null };

  static getDerivedStateFromError(error: Error) { return { error }; }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (typeof console !== 'undefined') console.warn('KAVACH screen error', error.message, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (!error) return this.props.children;
    return (
      <div className="container narrow section">
        <div className="eyebrow">Something on this screen stopped</div>
        <h1 style={{ fontSize: 'var(--text-2xl)', marginBottom: 12 }}>KAVACH could not finish drawing this page.</h1>
        <p className="u-muted" style={{ marginBottom: 20 }}>
          Nothing was sent anywhere and nothing on the node was changed. Reloading usually clears it.
        </p>
        <div className="btn-row" style={{ marginBottom: 24 }}>
          <button className="btn solid" type="button" onClick={() => { this.setState({ error: null }); location.hash = '#/app'; }}>
            Back to the workbench
          </button>
          <button className="btn ghost" type="button" onClick={() => location.reload()}>Reload</button>
        </div>
        <details className="disclosure">
          <summary>Technical details</summary>
          <div className="disclosure-body">
            <pre className="code">{error.message}</pre>
          </div>
        </details>
      </div>
    );
  }
}
