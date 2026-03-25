# 12_SETUP_GUIDE.md

## Backend Docker Setup
From the repo root:

```bash
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml up --build
```

Useful follow-up commands:

```bash
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml exec backend python manage.py createsuperuser
docker compose -f infra/docker/docker-compose.yml -f infra/docker/docker-compose.override.yml exec backend python manage.py test
```

## Backend URLs
- API root depends on configured endpoints
- schema: `http://localhost:8000/api/schema/`
- swagger: `http://localhost:8000/api/docs/swagger/`
- health: `http://localhost:8000/api/core/health/`

## Mobile And Admin
Mobile and admin remain scaffold-level until backend contracts stabilize. They should be started only after backend Phase 2 is green.

## Public Web
From `apps/web`:

```bash
npm install
npm run dev
```

Recommended local env:
- `NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api`
- optional: `WEB_DEMO_OWNER_TOKEN=<owner_jwt>`
