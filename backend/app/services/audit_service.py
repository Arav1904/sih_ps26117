"""Write/read access to the persistent audit ledger.

Deliberately not exposed over HTTP yet. Section 24 ("AUTHORIZATION")
requires every route touching protected data to validate identity, role
and ownership — none of which exist until the Phase 2 auth system lands.
Rather than ship a temporarily-unauthenticated `/api/v1/audit` endpoint
and gate it later, this stays a plain service function that Phase 2's
auth-protected router will call directly. Tests exercise it against the
database directly (see `backend/tests/test_audit_service.py`).
"""

from __future__ import annotations

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app.models.audit import AuditClass, AuditEvent


async def record_event(
    session: AsyncSession,
    *,
    cls: AuditClass,
    message: str,
    detail: str = "",
    actor_id: str | None = None,
    run_id: str | None = None,
    conversation_id: str | None = None,
    resource: str | None = None,
    correlation_id: str | None = None,
) -> AuditEvent:
    # Keyword stays `cls` at the service-function call site to match the
    # domain vocabulary everywhere else (AuditClass) — only the ORM field
    # itself had to be renamed. See the comment on AuditEvent.category.
    event = AuditEvent(
        category=cls,
        message=message,
        detail=detail,
        actor_id=actor_id,
        run_id=run_id,
        conversation_id=conversation_id,
        resource=resource,
        correlation_id=correlation_id,
    )
    session.add(event)
    await session.commit()
    await session.refresh(event)
    return event


async def list_events(session: AsyncSession, *, limit: int = 100) -> list[AuditEvent]:
    result = await session.execute(select(AuditEvent).order_by(AuditEvent.seq.desc()).limit(limit))
    return list(result.scalars().all())
