# KAVACH — Demo script

Four to six minutes. Works with or without the in-app guided demo (**Run the guided demo**, on the landing
page and the dashboard). Everything below is reproducible: the figures are identical on every machine.

---

## 0 · Before you start (10 seconds)

Open `/`. Zoom to 100%. Have the browser network panel ready if the judges are technical — the refusal counter
on the Security screen agrees with it.

---

## 1 · The landing page — 30 seconds

> "Refinery teams write inspection reports, approval notes, cost estimates, small pieces of code. None of it
> can be pasted into ChatGPT, because what is inside it is not allowed to leave the site. KAVACH is that
> assistant, running on one server inside the building."

Point at the diagram on the right.

> "Your file goes in. A local model reads it. An agent does the work. It checks its own answer. You get a file
> back. And nothing crosses that dotted line."

Scroll one screen.

> "The whole product is seven words — input, understand, select, act, verify, deliver, audit. Every screen you
> are about to see is one of those."

---

## 2 · Sign in — 15 seconds

Click **Enter the workbench**. Click the **Engineer** demo account; the form fills itself in. Sign in.

> "Three demo roles. This is demonstration authentication and the screen says so — there is no identity
> provider behind it, and we did not pretend otherwise."

---

## 3 · The dashboard — 20 seconds

> "Good morning, Sharma. What would you like to work on?"

Point at the black status strip.

> "Local only. Connected to the local node. Internet egress blocked. Four models loaded. Knowledge base
> indexed."

---

## 4 · The agent run — 90 seconds *(the centrepiece)*

Click **Review an inspection report**.

> "One request: read this fourteen-page report, check every finding against the procedure that governs it,
> price the work, and write me an approval note."

Press **Run with KAVACH**. Let it run and narrate the stages as they light up:

> "It opens the files. Works out what is being asked. Picks the right AI for each part — the report is nine
> pages of scans, so that goes to the OCR model, and there is a drawing, so that goes to the vision model."
>
> "Now it is working. Transcribing. Reading the mark-up on the drawing. Pulling out the findings. Finding the
> procedures. Cross-checking. Costing it. Drafting."

Click any step.

> "And every step will tell you why it exists and what the tool actually returned."

When the verify step flags:

> "Four checks. Citations pass. Arithmetic passes. Completeness passes. Coverage does not — one page could not
> be read well enough to trust, so the deliverable is flagged rather than presented as finished. That is the
> most important thing on this screen."

Scroll to **Deliverables** and press **Save** on the `.docx`.

> "That is a real Word document. Generated in the browser, no library, no network. Open it."

---

## 5 · Documents — 40 seconds

> "This is what the models actually saw."

Point at the **Human review required** callout.

> "Page 8 came back at 0.68 against a threshold of 0.85. Nothing from it went into the note, and the note names
> the page, so the engineer signing knows exactly what they still have to read themselves."

Point at page 7.

> "And this is the finding a text-only system would have missed entirely — somebody wrote a revised set
> pressure on the drawing by hand. The register still says 15.4. The drawing says 14.8. That disagreement is
> the highest-severity finding in the report."

---

## 6 · Sandbox — 30 seconds

Open **Sandbox**, press **Run it in the sandbox**.

> "Two of seven tests pass. It sees the failure itself, finds two defects — a unit conversion and a missing
> square root — patches it, and runs the tests again."

Watch the counter reach 7/7.

> "Seven of seven. The claim is not that the agent believes it is fixed. The suite ran, in a container with no
> network interface, and the runner reported it."

---

## 7 · Model routing — 25 seconds

> "Nobody picks a model. Five kinds of input, five different local models. Python goes to the coding model, a
> drawing goes to the vision model, a scan goes to OCR. Adding a sixth model is a row in a registry — no screen
> and no code path changes."

---

## 8 · The data boundary — 45 seconds *(the closer)*

Open **Data boundary**. Press **Try to send something out**.

> "That just genuinely attempted a call to a public AI endpoint, a telemetry socket and an analytics beacon.
> All three refused before a packet was sent. Your network panel will agree with this counter."

Press **Call the local node**.

> "And that one was permitted — it is loopback, inside the boundary. This is a policy, not a blanket block, so
> a real local backend keeps working."

Scroll to the honesty panel.

> "We are precise about scope. The browser guard demonstrates the policy. It is not a host firewall — a page
> cannot police its operating system. In deployment that is egress rules on the node and a sandbox with no
> network namespace. We say that on the screen rather than hoping nobody asks."

---

## 9 · Audit — 20 seconds

> "Who did it, what was asked for, which files were used, which AI was used, what was produced, what was held
> for review, and did anything try to leave the machine. Zero permitted, always."

Switch to **Technical log**, press **Export as a spreadsheet**.

---

## If you have another minute

- **Night Ops** — "the same product after hours: overnight queue, things waiting on a human, boundary watch."
- **Knowledge** — "question, documents searched, the passage found, the answer. An answer without a retrievable
  clause is a recollection, not a citation."
- **System** — switch to **Live local mode** and show it reporting honestly that no orchestrator is listening.

---

## Questions judges ask

**"Is a model actually running?"** No — and we label it. The agent timeline is a deterministic simulation so
the demo is reproducible. What is real: the network policy, the audit ledger, and the Office files. `/app/system`
explains the split.

**"Could this actually work air-gapped?"** The build fetches nothing — fonts are bundled, no CDN, no analytics.
`dist/index.html` opens from a USB stick with no server. A test in `npm test` enforces it.

**"What happens when you add a real backend?"** `store.start()` is the only place the simulation lives. Replace
the timer with a stream of `AgentStep` events from a FastAPI orchestrator and nothing above the service layer
moves. The network policy already permits loopback for exactly this reason.

**"Is the data real?"** No. Everything is fictional and labelled — no MRPL document, drawing, tag or rate is
used anywhere.
