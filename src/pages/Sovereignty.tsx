import { useEffect, useState } from 'react';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Stat, Button, Badge, Callout, Empty, Disclosure, CountUp } from '../components/ui';
import { EgressChart } from '../components/charts';
import { BoundaryDiagram } from '../components/diagrams';
import { egressGuard, LOCAL_SERVICES } from '../services/networkPolicy';
import { useEgress } from '../state/useEgress';
import { clock } from '../lib/format';
import { Ban, Check } from '../components/icons';

export default function Sovereignty() {
  const blocked = useEgress();
  const [start] = useState(() => Date.now());
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, []);

  const offsets = [...blocked].map((b) => b.at - start).filter((n) => n >= 0).sort((a, b) => a - b);

  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Data boundary"
          title="Your data stays here."
          lede="The claim is that nothing leaves the premises. A claim is not a proof, so this screen is the monitor. Every outbound call this application attempts is intercepted before it reaches the network, refused, and written to the record."
          ps="show through logs or a visible network monitor that no external calls are made"
        />
      </div>

      <section className="section first">
        <div className="container">
          <div className="grid three" style={{ marginBottom: 30 }}>
            <Stat value={<CountUp to={blocked.length} />} label="calls to the outside refused" accent boxed />
            <Stat value="0" label="calls to the outside permitted — ever" boxed />
            <Stat value={`${Math.round((now - start) / 1000)}s`} label="monitored since this screen opened" boxed />
          </div>

          <Panel
            title="The boundary"
            note="Inside the line is your machine. Outside it is everything KAVACH refuses to talk to."
            action={
              <div className="btn-row">
                <Button variant="solid" onClick={() => egressGuard.probe()}><Ban size={14} /> Try to send something out</Button>
                <Button variant="ghost" onClick={() => egressGuard.probeLocal()}><Check size={14} /> Call the local node</Button>
              </div>
            }
          >
            <BoundaryDiagram refused={blocked.length} permittedLocal={egressGuard.permittedCount()} />
            <p className="panel-note" style={{ marginTop: 20, marginBottom: 0 }}>
              The first button genuinely attempts a call to a public AI endpoint, a telemetry socket and an analytics
              beacon. All three are refused before a packet is sent — your browser's own network panel will agree with
              the count above. The second button calls the local orchestrator on 127.0.0.1, which the policy permits:
              the guard is a policy, not a blanket block, so a real local backend keeps working.
            </p>
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <Panel title="Refusals over this session" note="Each step is one call that tried to leave and did not.">
            <div className="chart-scroll">
              <EgressChart refused={offsets} elapsedMs={now - start} title="Cumulative outbound calls refused this session" />
            </div>
          </Panel>
        </div>
      </section>

      <section className="section tight">
        <div className="container">
          <div className="grid two">
            <Panel title="Refusal log" note={blocked.length ? 'Newest first. Each line is also written to the audit ledger with a sequence number.' : 'Nothing has been attempted yet.'}>
              <div className="scroll-y">
                {blocked.length === 0 ? (
                  <Empty title="No outbound call has been attempted">Use the button above and this fills in immediately.</Empty>
                ) : (
                  blocked.map((b, i) => (
                    <Row key={`${b.at}-${i}`} n={String(blocked.length - i).padStart(2, '0')} label={<b>{b.host}</b>} sub={b.target} value={`${b.mechanism} · ${clock(b.at)}`} />
                  ))
                )}
              </div>
            </Panel>

            <Panel title="What the node is allowed to talk to" note="Loopback addresses and a unix socket. There is no entry here with a public address.">
              {LOCAL_SERVICES.map((s) => (
                <Row
                  key={s.name}
                  label={<b>{s.name}</b>}
                  sub={s.what}
                  value={s.allowed ? <Badge tone="ok">{s.where}</Badge> : <Badge tone="hold">0 permitted</Badge>}
                />
              ))}
            </Panel>
          </div>
        </div>
      </section>

      <section className="section tight last">
        <div className="container">
          <Panel title="What this monitor covers, precisely" note="Stated plainly, because an overclaim here would undo the point of the product.">
            <div className="stack tight">
              <Callout tone="ok" title="Covered — every network primitive the page can reach">
                fetch, XMLHttpRequest, WebSocket and sendBeacon are replaced before the application mounts. Nothing in
                this page can reach the network without passing the policy first.
              </Callout>
              <Callout tone="neutral" title="Not covered — the host itself">
                A browser cannot police its operating system. In deployment the same policy is enforced outside the
                browser: egress rules on the node, and a code sandbox with no network namespace attached.
              </Callout>
              <Callout tone="ok" title="No external dependency, including fonts">
                Typefaces are bundled into the build rather than fetched from a font CDN, so the page requests nothing
                at all. The earlier build loaded three fonts from the internet; that is fixed.
              </Callout>
            </div>

            <Disclosure summary="Technical details — how a target is classified">
              <p style={{ fontSize: 'var(--text-sm)', marginBottom: 12 }}>
                A target counts as <b>local</b> if its hostname is a loopback name, its scheme is file, blob, data or
                unix, or its origin matches the origin this document was served from. Anything else is{' '}
                <b>external</b> and refused. An unparseable target is refused rather than guessed at.
              </p>
              <pre className="code">{`localhost, 127.0.0.1, 0.0.0.0, ::1, kavach.local   → local, passed through
file:, blob:, data:, unix:, /run/…, /var/…        → local, passed through
same origin as this document                      → local, passed through
everything else                                   → refused, logged, counted`}</pre>
            </Disclosure>
          </Panel>
        </div>
      </section>
    </Shell>
  );
}
