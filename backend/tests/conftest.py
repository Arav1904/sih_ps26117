"""Shared pytest fixtures.

IMPORTANT — read `docs/backend/PHASE_0_AUDIT.md` Section E before trusting
these results as "the backend works against PostgreSQL." They do not
prove that. This sandbox has no Docker daemon and no Postgres server
available (verified: `which docker`, `which psql` both fail — see the
audit report), so these tests run the same SQLModel/SQLAlchemy models
against an in-memory SQLite database instead. That is sufficient to
prove: the app boots, routes resolve, the ORM models are valid, and
service-layer logic (audit round-trip) works end-to-end against *a*
relational database.

It does NOT prove: the Alembic migration in
`migrations/versions/0001_audit_events.py` runs cleanly against real
PostgreSQL, that asyncpg connects correctly, or that Postgres-specific
types (the `audit_class` enum) behave identically. Running
`docker compose up -d postgres && alembic upgrade head` is a required,
not-yet-executed verification step — it is called out explicitly as
still-to-do in the session handoff, not silently assumed to pass.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator, Iterator

import pytest
import pytest_asyncio
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlmodel import SQLModel

os.environ.setdefault("ENVIRONMENT", "test")
os.environ.setdefault("DATABASE_URL", "sqlite+aiosqlite:///:memory:")
os.environ.setdefault("SESSION_SECRET", "test-only-secret-not-for-any-real-use")

from app.core.config import get_settings  # noqa: E402


@pytest.fixture(autouse=True, scope="session")
def _clear_settings_cache() -> Iterator[None]:
    get_settings.cache_clear()
    yield
    get_settings.cache_clear()


@pytest_asyncio.fixture
async def db_session() -> AsyncGenerator[AsyncSession, None]:
    # A fresh in-memory engine per test — no cross-test leakage.
    from app.db import base as db_base  # ensures models are imported/registered

    engine = create_async_engine("sqlite+aiosqlite:///:memory:")
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)

    factory = async_sessionmaker(bind=engine, expire_on_commit=False)
    async with factory() as session:
        yield session

    await engine.dispose()
    assert db_base.target_metadata is not None  # sanity: models registered
