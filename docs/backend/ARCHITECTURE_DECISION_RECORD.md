# KAVACH — Backend Architecture Decision Record

Session 1 · 2026-09-23. Supersedes nothing (first backend ADR). Written per Section 6 of the
master engineering prompt — every choice below states why it's needed, what was rejected, and
what it costs.

---

## AD-1 · Backend framework: FastAPI

**Decision:** FastAPI on Uvicorn, async throughout.

**Why:** native async I/O (needed for streaming run events and concurrent model calls without
a worker-per-request model), pydantic-native request/response validation (Section 29: "use
strongly typed request and response models"), automatic OpenAPI generation (Section 47), and
it is what both SIH presentation decks already commit to ("Delivery — FastAPI + React"). Using
anything else would mean either contradicting the team's own stated pitch or re-litigating a
decision that has no material downside.

**Rejected:** Django (sync-first, heavier, its batteries — admin, ORM migrations — duplicate
what SQLModel/Alembic already give us more directly); Flask (no native async, would need
separate ASGI wrapping); Node/Express (would fragment the stack into two languages for no
functional gain, and most of the target model-serving/RAG/OCR ecosystem — vLLM, Surya, pgvector
clients — is Python-first).

## AD-2 · Database: PostgreSQL, ORM: SQLModel over SQLAlchemy 2.0, migrations: Alembic

**Decision:** PostgreSQL is the sole authoritative datastore (Section 7). SQLModel (a thin
pydantic + SQLAlchemy layer maintained by FastAPI's author) for models, Alembic for migrations.

**Why SQLModel over plain SQLAlchemy or a second pydantic-only layer:** every table needs both
an ORM row type and an API schema type; SQLModel lets a single class serve both without hand
duplicating every field twice, while still being "real SQLAlchemy" underneath — `Settings`,
`Session`, `select()` all work exactly as documented for SQLAlchemy 2.0. The cost (a slightly
smaller community than raw SQLAlchemy) is worth the maintainability win for a project one
engineer has to carry across many separate sessions (Section 64).

**Why Alembic:** the de facto standard, integrates directly with SQLAlchemy's metadata, and
supports the async engine pattern used here (see `backend/migrations/env.py`).

**Rejected:** Prisma (would need a second, Node-based toolchain purely for migrations,
adding a language for no benefit); raw hand-written SQL migrations (loses autogenerate and
rollback safety for no offsetting gain at this project's schema complexity); MongoDB/NoSQL
(the domain — users, conversations, runs, findings, citations — is relational by nature: the
master prompt itself says "do not create one giant JSON blob table when relational modeling is
clearly superior," Section 7).

## AD-3 · Vector retrieval: PostgreSQL + pgvector (not Qdrant)

**Decision:** pgvector as a PostgreSQL extension, not a separate Qdrant service, for the RAG
knowledge base (Phase 7).

**Why:** Section 18 explicitly warns against adding Qdrant "simply because the presentation
mentions it" (it does — slide 3 of the v2 deck lists "Qdrant RAG"). Evaluated against the
actual criteria the section names:
  - *Expected corpus size:* the PS's own demo scope is a handful of inspection reports, SOPs
    and P&ID sheets per unit — tens of thousands of chunks at most, well inside pgvector's
    comfortable range (HNSW indexing handles this scale with no measurable disadvantage vs.
    Qdrant).
  - *Operational simplicity:* one fewer service to deploy, secure, back up, and keep patched
    on an air-gapped node (Section 52: "keep the stack understandable"). Every additional
    service is additional attack surface (Section 37) and an additional offline-mode
    dependency to verify (Section 28).
  - *Backup strategy:* falls out of the existing PostgreSQL backup for free (Section 58) —
    no second backup procedure to design, document, and test.
  - *Transactional integrity:* a citation record and the embedding it points at can live in
    the same transaction, which matters for Section 17's "do not allow the LLM to invent
    citations" guarantee — the backend can enforce referential integrity at the database level
    between `document_chunks` and `citations` in a way that's awkward across two databases.

**Documented reconsideration trigger:** if a deployment's corpus grows past roughly one to two
million chunks, or if query latency under pgvector's HNSW index measurably degrades in
practice, Qdrant becomes the right call and this ADR should be revisited — not before. This is
recorded now specifically so a future session doesn't have to redo this analysis from zero.

## AD-4 · Model serving: Ollama first, vLLM as a documented upgrade path

**Decision:** target Ollama as the local inference server for Phase 5, behind the model
gateway abstraction (Section 14) — not vLLM, despite both decks naming vLLM/NIM first.

**Why:** Section 53 ("HARDWARE AWARENESS") requires supporting a smaller-model profile when
high-end hardware is unavailable, and explicitly: "do not build an architecture that assumes a
120B model." Ollama has materially lower operational complexity (single binary, built-in model
management, GGUF quantization support out of the box) which matters most for the
`demo-small`/single-workstation profile this project will actually be developed and graded
against. Because the model gateway (`ModelGateway.chat()/stream()/...`) is the seam the rest of
the app talks to, **switching the backend from Ollama to vLLM later is a configuration and
adapter-implementation change, not an architecture change** — this is the entire point of
Section 14's abstraction requirement. vLLM remains the documented path for a real MRPL-scale
enterprise deployment with dedicated GPU capacity, and the gateway interface is written
provider-agnostically from the start so that swap costs one adapter file.

**Rejected (for now, not permanently):** llama.cpp directly (lower-level than needed; Ollama
already wraps it); committing to vLLM immediately (contradicts Section 53's own hardware
guidance for this project's actual development context).

## AD-5 · Agent orchestration: custom bounded state machine (not LangGraph)

**Decision:** a small, custom planner-executor loop, not LangGraph or another agent framework.

**Why:** Section 10 requires hard, server-side bounds on steps/tool-calls/time/retries and an
explicit, auditable state machine (`pending -> running -> ... -> human_review_required ->
completed/failed`). A framework's abstractions (LangGraph's graph/node model in particular)
would need to be fought, not used, to keep the loop as legible and boundable as Section 10
demands, and every additional framework is an additional dependency to license-check (Section
55) and keep working offline (Section 28). A project this security-sensitive benefits more
from an orchestrator whose entire control flow lives in one readable module than from framework
flexibility it does not need. Revisit if the agent's branching complexity grows well past what
a linear bounded loop with named states can express clearly.

## AD-6 · Sandbox: Docker container, no network namespace

**Decision:** Docker (not Podman/gVisor/Firecracker) for code execution isolation, Phase 8.

**Why:** Docker is already the deployment mechanism (AD-8 below) so no second container
runtime needs to be learned/operated; `--network none`, `--read-only`, a CPU/memory cgroup
limit, and a non-root user together satisfy every requirement in Section 13 without needing a
microVM's added operational weight. Revisit toward gVisor/Firecracker only if a real production
deployment's threat model requires kernel-level isolation beyond what container namespaces
provide — not needed for this project's stated scope.

## AD-7 · Authentication: local bcrypt + server-side session now, provider interface reserved

**Decision:** Phase 2 implements real local authentication (bcrypt-hashed passwords, signed
server-side session cookie, `httponly`/`secure`/`samesite` attributes) behind an
`AuthProvider` interface, with LDAP/OIDC adapters as later, config-selected implementations of
the same interface — not built this session.

**Why:** Section 23 requires both "secure password hashing where local credentials are used"
*and* "an authentication provider abstraction for local auth / LDAP-AD / OIDC-SSO" — the
interface has to exist before any concrete provider does, so nothing above it (route
dependencies, `get_current_user`) has to change when MRPL's real identity system is known.
JWT-in-localStorage was considered and rejected per Section 23's own explicit instruction ("no
JWT in insecure browser storage unless strongly justified") — a signed httponly cookie gives
equivalent statelessness options (a JWT *inside* the cookie is fine later if needed) without
the XSS exposure of browser-readable storage.

## AD-8 · Deployment: Docker Compose (not Kubernetes)

**Decision:** Docker Compose for the full local/on-prem stack.

**Why:** Section 52 explicitly says "Kubernetes only if genuinely justified" and this project's
target (a single MRPL on-prem GPU server, per the deck) has no multi-node scaling requirement
that would justify Kubernetes' added operational complexity. Compose gives reproducible
multi-service startup, health-check-gated dependency ordering, and named volumes for
persistence — everything Section 52 actually asks for.

## AD-9 · Frontend/backend communication: REST + Server-Sent Events

**Decision:** REST for CRUD-shaped resources (conversations, files, artifacts, audit), SSE for
run event streams (Section 30) and chat token streaming (Section 31).

**Why:** SSE is simpler than WebSocket for the actual traffic shape here (server-to-client
event stream, no client-to-server push needed mid-stream beyond an occasional cancel — which is
a separate `POST .../cancel` call, not a stream message), works over plain HTTP/1.1 (fewer
proxy/firewall surprises on an air-gapped industrial network than WebSocket upgrade handshakes
sometimes cause), and reconnects natively in browsers via `EventSource`'s built-in retry.
WebSocket remains available as a documented fallback if a future phase needs true bidirectional
streaming (e.g. live cancellation-with-acknowledgement mid-token); not needed yet.

## AD-10 · What Phase 1 actually implements, and what every later phase still owes

This ADR covers the full-stack target. **Only AD-1 (FastAPI), AD-2 (PostgreSQL/SQLModel/
Alembic), and the configuration/observability/error-handling scaffolding they require are
implemented and tested this session.** AD-3 through AD-9 are documented now, specifically so
they don't have to be re-derived by whichever session picks up Phase 5 through 10, but no code
for the model gateway, agent loop, sandbox, or vector retrieval exists yet. See
`docs/backend/ROADMAP.md` for the phase-by-phase plan and `docs/handoff/SESSION_01_HANDOFF.md`
for the precise next-session starting point.
