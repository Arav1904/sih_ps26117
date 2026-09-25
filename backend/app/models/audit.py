"""The audit ledger, as a real table.

This is the first schema piece implemented because almost every other
phase (auth, agent runs, artifacts, sovereignty) needs somewhere durable
to write an event, and because the frontend's `src/services/audit.ts`
already defines the exact shape (`AuditEvent`) that this table must be
able to reproduce losslessly — see the mapping table in
`docs/backend/PHASE_0_AUDIT.md`, Section C.

Design notes (Section 25, "AUDIT LEDGER"):
  * `seq` is a database-generated, monotonically increasing integer —
    not client-supplied — so ordering cannot be forged by a caller.
  * `id` is a separate UUID used as the stable external reference (so a
    future re-numbering or partitioning strategy never breaks a link
    from e.g. an artifact record back to the audit event that created it).
  * `actor_id`, `run_id`, `conversation_id`, `resource` are plain
    nullable strings in this phase, not foreign keys yet — the tables
    they will eventually reference (`users`, `agent_runs`,
    `conversations`) do not exist until Phase 2/4. This is recorded as a
    known follow-up in the Phase 0 audit rather than silently modeled as
    if those relationships already existed.
  * No full request/response bodies or secrets are stored in `detail` —
    callers are responsible for keeping it to non-sensitive metadata
    (Section 25: "Do not expose raw secrets ... in logs by default").
"""

from __future__ import annotations

import enum
import uuid
from datetime import datetime, timezone

from sqlalchemy import Column
from sqlalchemy import Enum as SAEnum
from sqlmodel import Field, SQLModel


class AuditClass(str, enum.Enum):
    SESSION = "session"
    TASK = "task"
    AGENT = "agent"
    SECURITY = "security"
    ARTIFACT = "artifact"


class AuditEvent(SQLModel, table=True):
    __tablename__ = "audit_events"

    seq: int | None = Field(default=None, primary_key=True)
    id: uuid.UUID = Field(default_factory=uuid.uuid4, index=True, unique=True, nullable=False)
    at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False, index=True)
    # NOTE: the frontend/API contract (src/types.ts AuditEvent) calls this
    # field `cls`. It cannot be named `cls` here: SQLModel/Pydantic models
    # accept `cls` as an implicit constructor parameter, so a field of that
    # name collides with it (`SQLModel.__new__() got multiple values for
    # argument 'cls'` — caught by backend/tests/test_audit_service.py
    # during Phase 1). The ORM column is named `category`; the Phase 2 API
    # schema is responsible for exposing it to clients as `cls` via a
    # pydantic alias so the wire contract stays exactly what the frontend
    # already expects.
    category: AuditClass = Field(sa_column=Column(SAEnum(AuditClass, name="audit_class"), nullable=False, index=True))
    message: str = Field(nullable=False)
    detail: str = Field(default="", nullable=False)

    # Correlation — nullable until the referenced tables exist (see module docstring).
    actor_id: str | None = Field(default=None, index=True)
    run_id: str | None = Field(default=None, index=True)
    conversation_id: str | None = Field(default=None, index=True)
    resource: str | None = Field(default=None)
    correlation_id: str | None = Field(default=None, index=True)
