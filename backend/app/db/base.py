"""Import surface for Alembic's autogenerate and for anything that needs
the full set of ORM models registered against SQLModel's metadata.

Alembic's `env.py` imports `target_metadata` from here. Every model
module added in later phases (users, conversations, runs, artifacts...)
must be imported in this file or Alembic will not see it.
"""

from sqlmodel import SQLModel

from app.models.audit import AuditEvent  # noqa: F401  (registers the table)

target_metadata = SQLModel.metadata
