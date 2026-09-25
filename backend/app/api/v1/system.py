"""System routes: `/health`, `/ready`, `/version`.

`/health` is a pure liveness probe — it never touches the database and
always answers instantly, so an orchestrator can use it to decide
whether to restart the process.

`/ready` is a readiness probe — it actually checks the database
connection and reports `ready: false` with the real reason when a
dependency is down. This distinction matters for Section 60 ("NO FALSE
CLAIMS"): `/health` returning 200 must never be read as "the backend is
fully operational."
"""

from __future__ import annotations

from fastapi import APIRouter

from app import __version__
from app.core.config import get_settings
from app.db.session import database_is_reachable
from app.schemas.system import HealthResponse, ReadinessCheck, ReadinessResponse, VersionResponse

router = APIRouter(tags=["system"])


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    settings = get_settings()
    return HealthResponse(
        status="ok",
        app_name=settings.app_name,
        version=__version__,
        environment=settings.environment.value,
    )


@router.get("/ready", response_model=ReadinessResponse)
async def ready() -> ReadinessResponse:
    db_ok, db_error = await database_is_reachable()
    checks = [ReadinessCheck(name="database", ok=db_ok, detail=db_error)]
    return ReadinessResponse(ready=all(c.ok for c in checks), checks=checks)


@router.get("/version", response_model=VersionResponse)
async def version() -> VersionResponse:
    settings = get_settings()
    return VersionResponse(
        version=__version__,
        environment=settings.environment.value,
        sovereign_mode=settings.sovereign_mode,
    )
