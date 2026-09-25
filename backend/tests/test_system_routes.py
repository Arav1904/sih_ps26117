from __future__ import annotations

import pytest
from httpx import ASGITransport, AsyncClient


@pytest.mark.asyncio
async def test_health_ok() -> None:
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["app_name"] == "KAVACH Backend"


@pytest.mark.asyncio
async def test_ready_reports_database_state() -> None:
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/ready")
    assert resp.status_code == 200
    body = resp.json()
    assert "ready" in body
    assert body["checks"][0]["name"] == "database"


@pytest.mark.asyncio
async def test_version_reports_sovereign_mode_flag() -> None:
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/version")
    assert resp.status_code == 200
    assert resp.json()["sovereign_mode"] is False


@pytest.mark.asyncio
async def test_unknown_route_returns_structured_404() -> None:
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/does-not-exist")
    assert resp.status_code == 404
    body = resp.json()
    assert body["error"]["code"] == "HTTP_404"
    assert "message" in body["error"]


@pytest.mark.asyncio
async def test_response_carries_request_id_header() -> None:
    from app.main import create_app

    app = create_app()
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/v1/health")
    assert "x-request-id" in resp.headers
