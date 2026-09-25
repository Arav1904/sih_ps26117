# KAVACH backend image. Built for local/on-prem docker-compose use, not
# published to any registry. No build-time network calls beyond pulling
# the base image and pip installing from the lockfile below — nothing
# is fetched at *container runtime* (Section 28, "OFFLINE MODE").
FROM python:3.12-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PIP_NO_CACHE_DIR=1

WORKDIR /app

RUN addgroup --system kavach && adduser --system --ingroup kavach kavach

COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

COPY app ./app
COPY migrations ./migrations
COPY alembic.ini ./

RUN mkdir -p /app/data/storage && chown -R kavach:kavach /app
USER kavach

EXPOSE 8000

# Migrations are run as an explicit, separate step (see
# docker-compose.yml's `backend-migrate` service / docs/backend/DEPLOYMENT.md)
# rather than automatically on every container start, so a failed
# migration never gets masked by a server that comes up anyway.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
