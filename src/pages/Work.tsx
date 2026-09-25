import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Empty, Button, Badge } from '../components/ui';
import { AskKavach } from '../components/AskKavach';
import { APP_NAV, GROUP_LABEL, type NavItem } from '../config/nav';
import { SCENARIOS } from '../data/scenarios';
import { store, useApp } from '../state/store';
import { downloadArtifact } from '../services/artifact';
import { seconds } from '../lib/format';
import { Play, Download, ArrowRight } from '../components/icons';

export default function Work() {
  const app = useApp();
  const navigate = useNavigate();
  const groups: NavItem['group'][] = ['work', 'evidence', 'system'];

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Work"
          title="Everything on this node."
          lede="Every screen in the workbench, what each one is for, and everything this session has produced so far."
        />
      </div>

      <section className="section first">
        <div className="container">
          <AskKavach compact placeholder="Describe a job and KAVACH will plan it" />
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel title="Start a job" note="Two demonstration task classes. Adding a third is one entry in a data file — no screen changes.">
              {Object.values(SCENARIOS).map((sc) => (
                <Row
                  key={sc.key}
                  label={<b>{sc.label}</b>}
                  sub={sc.prompt}
                  value={
                    <Button size="sm" variant="solid" onClick={() => { store.start(sc.key); navigate(sc.key === 'code' ? '/app/sandbox' : '/app/run'); }}>
                      <Play size={13} /> Run
                    </Button>
                  }
                />
              ))}
            </Panel>

            <Panel title="Files produced this session" note={app.artifacts.length ? 'Real Word, Excel and Python files, generated on this machine with no library and no network.' : 'Deliverables appear here once a job completes.'}>
              {app.artifacts.length === 0 ? (
                <Empty title="Nothing produced yet" action={<Button variant="solid" onClick={() => { store.start('inspection'); navigate('/app/run'); }}><Play size={14} /> Run the inspection review</Button>} />
              ) : (
                app.artifacts.map((a) => (
                  <Row
                    key={a.id}
                    label={<b>{a.name}</b>}
                    sub={`${a.note} · from ${a.sources}`}
                    value={
                      <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                        <Badge tone={a.verification === 'pass' ? 'ok' : 'hold'}>{a.verification === 'pass' ? 'verified' : 'flagged'}</Badge>
                        <Button size="sm" onClick={() => downloadArtifact(a)}><Download size={13} /></Button>
                      </span>
                    }
                  />
                ))
              )}
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Panel title="Run history" note={app.history.length ? `${app.history.length} run${app.history.length === 1 ? '' : 's'} in this session.` : 'Runs are kept for the length of the session only.'}>
            {app.history.length === 0 ? (
              <Empty title="No runs yet">Start one above and it will be listed here with its timings.</Empty>
            ) : (
              app.history.map((h) => (
                <Row
                  key={h.id}
                  label={<b>{h.label}</b>}
                  sub={`${h.toolCalls.length} tool calls · ${h.artifacts.length} file${h.artifacts.length === 1 ? '' : 's'}`}
                  value={seconds((h.finishedAt ?? Date.now()) - h.startedAt)}
                />
              ))
            )}
          </Panel>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <div className="grid three">
            {groups.map((g) => (
              <Panel key={g} title={GROUP_LABEL[g]}>
                {APP_NAV.filter((i) => i.group === g).map((i) => (
                  <Row key={i.to} label={<Link to={i.to} className="linkish">{i.label}</Link>} sub={i.blurb} />
                ))}
              </Panel>
            ))}
          </div>
          <p className="u-muted" style={{ fontSize: 'var(--text-sm)', marginTop: 20 }}>
            Each screen answers a specific line of the problem statement — the line is printed at the top of the
            screen itself. <Link to="/how-it-works" className="linkish">How it all fits together <ArrowRight size={12} style={{ display: 'inline' }} /></Link>
          </p>
        </div>
      </section>
    </Shell>
  );
}
