from __future__ import annotations

from pydantic import BaseModel


class HealthResponse(BaseModel):
    status: str  # "ok" — liveness only, never claims dependencies are up
    app_name: str
    version: str
    environment: str


class ReadinessCheck(BaseModel):
    name: str
    ok: bool
    detail: str | None = None


class ReadinessResponse(BaseModel):
    ready: bool
    checks: list[ReadinessCheck]


class VersionResponse(BaseModel):
    version: str
    environment: str
    sovereign_mode: bool
