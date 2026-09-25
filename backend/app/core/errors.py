from __future__ import annotations

import logging

from fastapi import FastAPI, Request, status
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from app.core.logging import get_request_id
from app.schemas.errors import ErrorBody, ErrorResponse

logger = logging.getLogger(__name__)


class AppError(Exception):
    """Base for backend-raised errors that should reach the client as a
    structured `ErrorResponse` rather than an unhandled 500."""

    def __init__(self, code: str, message: str, *, status_code: int = 400, retryable: bool = False) -> None:
        super().__init__(message)
        self.code = code
        self.message = message
        self.status_code = status_code
        self.retryable = retryable


def register_exception_handlers(app: FastAPI) -> None:
    @app.exception_handler(AppError)
    async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:  # noqa: ARG001
        body = ErrorResponse(
            error=ErrorBody(
                code=exc.code,
                message=exc.message,
                request_id=get_request_id(),
                retryable=exc.retryable,
            )
        )
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(RequestValidationError)
    async def validation_error_handler(request: Request, exc: RequestValidationError) -> JSONResponse:  # noqa: ARG001
        body = ErrorResponse(
            error=ErrorBody(
                code="VALIDATION_ERROR",
                message="The request did not pass validation.",
                request_id=get_request_id(),
                retryable=False,
                detail={"errors": exc.errors()},
            )
        )
        return JSONResponse(status_code=status.HTTP_422_UNPROCESSABLE_ENTITY, content=body.model_dump())

    @app.exception_handler(StarletteHTTPException)
    async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:  # noqa: ARG001
        body = ErrorResponse(
            error=ErrorBody(
                code=f"HTTP_{exc.status_code}",
                message=str(exc.detail),
                request_id=get_request_id(),
                retryable=False,
            )
        )
        return JSONResponse(status_code=exc.status_code, content=body.model_dump())

    @app.exception_handler(Exception)
    async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:  # noqa: ARG001
        # Never leak the exception message or a stack trace to the client
        # (Section 57). It is still logged, in full, locally.
        logger.exception("unhandled_exception")
        body = ErrorResponse(
            error=ErrorBody(
                code="INTERNAL_ERROR",
                message="An unexpected error occurred.",
                request_id=get_request_id(),
                retryable=False,
            )
        )
        return JSONResponse(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, content=body.model_dump())
