"""Structured error envelope (Section 57, "API AND ERROR UX").

Every error the API returns — validation, auth, not-found, upstream
failure — is shaped like this. No stack traces, secrets, connection
strings or internal prompts are ever placed in `message` or `detail`.
"""

from __future__ import annotations

from pydantic import BaseModel


class ErrorBody(BaseModel):
    code: str
    message: str
    request_id: str | None = None
    retryable: bool = False
    detail: dict | None = None


class ErrorResponse(BaseModel):
    error: ErrorBody
