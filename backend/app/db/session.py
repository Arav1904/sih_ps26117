"""Async database engine and session factory.

Every route that touches the database depends on `get_session` via
FastAPI's dependency-injection system — nothing constructs its own engine
or opens a connection outside this module (Section 41, "PERFORMANCE":
connection pooling; Section 62, "MAINTAINABILITY": clear infrastructure
boundary).
"""

from __future__ import annotations

from collections.abc import AsyncGenerator

from sqlalchemy.ext.asyncio import AsyncEngine, AsyncSession, async_sessionmaker, create_async_engine

from app.core.config import get_settings

_engine: AsyncEngine | None = None
_session_factory: async_sessionmaker[AsyncSession] | None = None


def get_engine() -> AsyncEngine:
    global _engine
    if _engine is None:
        settings = get_settings()
        connect_args: dict[str, object] = {}
        engine_kwargs: dict[str, object] = {"echo": settings.database_echo}
        # SQLite (used only for local unit tests, never for a real
        # deployment — see docs/backend/PHASE_0_AUDIT.md, Section D) does
        # not support the pool-size/overflow knobs Postgres does.
        if settings.database_url.startswith("postgresql"):
            engine_kwargs["pool_size"] = settings.database_pool_size
            engine_kwargs["max_overflow"] = settings.database_max_overflow
        _engine = create_async_engine(settings.database_url, connect_args=connect_args, **engine_kwargs)
    return _engine


def get_session_factory() -> async_sessionmaker[AsyncSession]:
    global _session_factory
    if _session_factory is None:
        _session_factory = async_sessionmaker(bind=get_engine(), expire_on_commit=False)
    return _session_factory


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    factory = get_session_factory()
    async with factory() as session:
        yield session


async def dispose_engine() -> None:
    """Called on application shutdown so no dangling connections remain."""
    global _engine, _session_factory
    if _engine is not None:
        await _engine.dispose()
    _engine = None
    _session_factory = None


async def database_is_reachable() -> tuple[bool, str | None]:
    """Used by the readiness endpoint. Never raises — returns (ok, error)."""
    from sqlalchemy import text

    try:
        engine = get_engine()
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return True, None
    except Exception as exc:  # noqa: BLE001 — readiness probe must not crash
        return False, str(exc)
