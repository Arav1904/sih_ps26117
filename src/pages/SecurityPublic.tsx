import { Link } from 'react-router-dom';
import { Shell } from '../components/Shell';
import { PageHead } from '../components/PageHead';
import { Panel, Row, Callout, SectionHead, Button } from '../components/ui';
import { BoundaryDiagram } from '../components/diagrams';
import { LOCAL_SERVICES, egressGuard } from '../services/networkPolicy';
import { useEgress } from '../state/useEgress';
import { SANDBOX_LIMITS } from '../data/corpus';
import { ArrowRight } from '../components/icons';

export default function SecurityPublic() {
  const blocked = useEgress();
  return (
    <Shell>
      <div className="container">
        <PageHead
          eyebrow="Security"
          title="Your data stays here."
          lede="The premise of KAVACH is that confidential industrial work never leaves the site. A premise is not a proof, so the prototype demonstrates it instead of asserting it — and is precise about where the demonstration ends and real infrastructure begins."
          action={<Button variant="solid" onClick={() => egressGuard.probe()}>Try to send something out</Button>}
        />
      </div>

      <section className="section first">
        <div className="container">
          <Panel
            title="The boundary"
            note={`${blocked.length} outbound call${blocked.length === 1 ? '' : 's'} attempted and refused since this page loaded. None permitted, ever.`}
          >
            <BoundaryDiagram refused={blocked.length} permittedLocal={egressGuard.permittedCount()} />
          </Panel>
        </div>
      </section>

      <section className="section sunken">
        <div className="container">
          <div className="grid two">
            <Panel title="What the node is allowed to talk to" note="Loopback addresses and a unix socket. There is no entry here with a public address.">
              {LOCAL_SERVICES.map((s) => (
                <Row key={s.name} label={<b>{s.name}</b>} sub={s.what} value={s.where} />
              ))}
            </Panel>
            <Panel title="What the code sandbox is allowed to do" note="Generated code is the obvious way for something to phone home, so it runs with nothing to phone home with.">
              {SANDBOX_LIMITS.map((l) => (
                <Row key={l.k} label={<b>{l.k}</b>} sub={l.v} />
              ))}
            </Panel>
          </div>
        </div>
      </section>

      <section className="section last">
        <div className="container">
          <SectionHead title="Stated plainly, because an overclaim here would undo the point">
            Three sentences that matter more than any diagram on this page.
          </SectionHead>
          <div className="stack">
            <Callout tone="ok" title="What the browser demonstration genuinely enforces">
              Every network primitive the page can reach — fetch, XMLHttpRequest, WebSocket and sendBeacon — is
              replaced before the application mounts. An external call is refused before a packet is sent and the
              refusal is written to the audit ledger. Your browser's own network panel agrees with the counter.
            </Callout>
            <Callout tone="neutral" title="What a browser cannot do">
              A page cannot police its operating system. In deployment the same policy is enforced outside the
              browser: egress rules on the node, container isolation for the model server, and a code sandbox with
              no network namespace attached. The browser guard is a demonstration of the policy, not the mechanism
              that would enforce it in a refinery.
            </Callout>
            <Callout title="What this prototype is">
              A working front end over a deterministic simulation of the agent. The network policy, the audit ledger
              and the generated Office files are real. The model inference, OCR confidences and routing statistics
              are fixed demonstration values, labelled as such wherever they appear. Demonstration data is fictional —
              no MRPL document, drawing, tag or rate is used anywhere in it.
            </Callout>
          </div>
          <div className="btn-row" style={{ marginTop: 28 }}>
            <Link to="/app/sovereignty" className="btn solid">Open the live monitor <ArrowRight size={15} /></Link>
            <Link to="/app/audit" className="btn ghost">See the audit ledger</Link>
          </div>
        </div>
      </section>
    </Shell>
  );
}
