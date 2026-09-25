"""Centralized, typed application configuration.

Every runtime setting the backend needs lives here and only here — no
module elsewhere in this codebase should read `os.environ` directly or
hard-code a host/port/path literal. Section 39 of the KAVACH master
engineering prompt ("CONFIGURATION") requires exactly this: a single
typed source of truth that fails fast when a required value is missing,
rather than falling back to a silently wrong default in production.

`Settings` is a pydantic-settings `BaseSettings` subclass, so every field
can be overridden by an environment variable of the same name (case
insensitive) or by a `.env` file at the repository root. See
`.env.example` for the documented list of variables.
"""

from __future__ import annotations

from enum import Enum
from functools import lru_cache
from pathlib import Path

from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Environment(str, Enum):
    """Which of the four deployment modes described in the master
    prompt (Section 8, "SUPABASE RULE" / demo vs sovereign mode) this
    process is running as. Nothing about *what* the backend does
    changes between these — only defaults for CORS, docs exposure and
    logging verbosity do. The sovereign/offline guarantee itself is
    enforced independently of this flag (Section 26/28), so a
    misconfigured `environment` value can never be used to justify a
    network egress.
    """

    DEVELOPMENT = "development"
    DEMO = "demo"
    SOVEREIGN = "sovereign"
    TEST = "test"


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # --- Identity / runtime mode -----------------------------------
    app_name: str = "KAVACH Backend"
    environment: Environment = Environment.DEVELOPMENT
    sovereign_mode: bool = Field(
        default=False,
        description=(
            "When true, every outbound-capable subsystem (model gateway, "
            "artifact tools, sandbox) must refuse to initialize against a "
            "non-local endpoint. See Section 26/27 of the master prompt."
        ),
    )

    # --- Network ------------------------------------------------------
    api_host: str = "127.0.0.1"
    api_port: int = 8000
    api_v1_prefix: str = "/api/v1"
    allowed_origins: list[str] = Field(default_factory=lambda: ["http://127.0.0.1:5173", "http://localhost:5173"])

    # --- Database -------------------------------------------------------
    # Async SQLAlchemy URL, e.g. postgresql+asyncpg://user:pass@host:5432/db
    database_url: str = Field(
        default="postgresql+asyncpg://kavach:kavach_dev_only@127.0.0.1:5432/kavach",
        description="Authoritative PostgreSQL connection string. Never committed with real credentials.",
    )
    database_pool_size: int = 10
    database_max_overflow: int = 5
    database_echo: bool = False

    # --- Storage --------------------------------------------------------
    storage_root: Path = Field(default=Path("./data/storage"))
    max_upload_bytes: int = 50 * 1024 * 1024  # 50 MB, Section 39/22

    # --- Auth (scaffolded now, enforced starting Phase 2) ---------------
    session_secret: str = Field(
        default="REPLACE_ME_DEV_ONLY_NOT_FOR_PRODUCTION",
        description="Symmetric key used to sign session cookies. MUST be overridden outside development.",
    )
    session_ttl_minutes: int = 60 * 12

    # --- Bounded execution limits (Section 10) ---------------------------
    max_agent_steps: int = 25
    max_tool_calls: int = 50
    max_run_seconds: int = 600
    max_retry_count: int = 3

    # --- Logging ----------------------------------------------------------
    log_level: str = "INFO"

    @field_validator("database_url")
    @classmethod
    def _reject_empty_database_url(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError(
                "DATABASE_URL is required and must not be empty. "
                "Set it in the environment or in a .env file (see .env.example)."
            )
        return v

    @field_validator("session_secret")
    @classmethod
    def _warn_default_secret_only_in_dev(cls, v: str) -> str:
        # We cannot know `environment` yet inside a single-field validator
        # (field order), so the hard enforcement of "no default secret
        # outside development" lives in `Settings.model_post_init` below,
        # which has access to the fully-populated model.
        return v

    def model_post_init(self, __context: object) -> None:  # noqa: D401
        if self.environment != Environment.DEVELOPMENT and self.session_secret.startswith("REPLACE_ME"):
            raise ValueError(
                "SESSION_SECRET must be set to a real, non-default value outside "
                "of ENVIRONMENT=development. Refusing to start with a "
                "placeholder secret in demo/sovereign/test mode."
            )
        self.storage_root.mkdir(parents=True, exist_ok=True)


@lru_cache
def get_settings() -> Settings:
    """Settings are read once per process and cached — this is the only
    supported way to obtain configuration anywhere in the backend.
    """
    return Settings()
