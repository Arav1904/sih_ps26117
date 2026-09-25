from __future__ import annotations

import pytest
from pydantic import ValidationError

from app.core.config import Environment, Settings


def test_default_settings_load_in_development() -> None:
    s = Settings(_env_file=None, environment=Environment.DEVELOPMENT)  # type: ignore[call-arg]
    assert s.environment == Environment.DEVELOPMENT
    assert s.database_url


def test_empty_database_url_is_rejected() -> None:
    with pytest.raises(ValidationError):
        Settings(_env_file=None, database_url="")  # type: ignore[call-arg]


def test_default_session_secret_rejected_outside_development() -> None:
    # Raised from Settings.model_post_init, which runs after field-level
    # validation completes — pydantic v2 does not wrap a model_post_init
    # exception into ValidationError, so this is a plain ValueError. That
    # surprised the first version of this test (it asserted
    # ValidationError and failed) — recorded here rather than silently
    # "fixed" by loosening the assertion.
    # session_secret passed explicitly (with the placeholder prefix) so the
    # test is not at the mercy of conftest.py's SESSION_SECRET env var,
    # which — correctly — outranks the class default via pydantic-settings'
    # normal precedence, and would otherwise mask this check.
    with pytest.raises(ValueError, match="SESSION_SECRET"):
        Settings(  # type: ignore[call-arg]
            _env_file=None,
            environment=Environment.SOVEREIGN,
            session_secret="REPLACE_ME_DEV_ONLY_NOT_FOR_PRODUCTION",
        )


def test_custom_session_secret_accepted_outside_development() -> None:
    s = Settings(_env_file=None, environment=Environment.DEMO, session_secret="a-real-random-secret")  # type: ignore[call-arg]
    assert s.session_secret == "a-real-random-secret"
