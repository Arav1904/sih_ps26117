from __future__ import annotations

import pytest
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.audit import AuditClass
from app.services.audit_service import list_events, record_event


@pytest.mark.asyncio
async def test_record_and_list_round_trip(db_session: AsyncSession) -> None:
    event = await record_event(
        db_session,
        cls=AuditClass.SESSION,
        message="Session opened on the on-premise node",
        detail="engineer@kavach.local",
    )
    assert event.seq is not None
    assert event.id is not None

    events = await list_events(db_session)
    assert len(events) == 1
    assert events[0].message == "Session opened on the on-premise node"
    assert events[0].category == AuditClass.SESSION


@pytest.mark.asyncio
async def test_seq_is_monotonically_increasing_and_not_client_supplied(db_session: AsyncSession) -> None:
    first = await record_event(db_session, cls=AuditClass.TASK, message="first")
    second = await record_event(db_session, cls=AuditClass.TASK, message="second")
    assert second.seq is not None and first.seq is not None
    assert second.seq > first.seq


@pytest.mark.asyncio
async def test_list_events_orders_newest_first(db_session: AsyncSession) -> None:
    await record_event(db_session, cls=AuditClass.AGENT, message="older")
    await record_event(db_session, cls=AuditClass.AGENT, message="newer")
    events = await list_events(db_session)
    assert events[0].message == "newer"
    assert events[1].message == "older"
