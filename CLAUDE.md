# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Overview

UyTop is a real estate platform structured as a polyglot monorepo with three active application surfaces:

- `apps/backend/` — Django 5 + DRF REST API (source of truth for all business logic)
- `apps/web/` — Next.js 15 public-facing homepage and map-based property discovery
- `apps/admin/` — Next.js 15 admin panel for moderation and operations
- `docs/` — Canonical project documentation (architecture, schema, API, roadmap)
- `uytop/` — **Legacy planning material; do not use as an implementation reference**

## Commands

Each app is developed independently. Navigate into the app directory before running commands.

### Backend (`apps/backend/`)
```bash
# Run development server (requires PostgreSQL + PostGIS + Redis running)
python manage.py runserver

# Apply migrations
python manage.py migrate

# Run tests
python manage.py test

# Run a single test module
python manage.py test apps.accounts.tests

# Generate OpenAPI schema
python manage.py spectacular --file schema.yml
```

Settings are split: `config/settings/base.py`, `config/settings/dev.py`, `config/settings/prod.py`. The `DJANGO_SETTINGS_MODULE` env var selects the active settings file. All runtime config is environment-variable driven — see `base.py` for the full list.

### Web (`apps/web/`)
```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run lint     # ESLint via next lint
```

### Admin (`apps/admin/`)
```bash
npm run dev
npm run build
npm run lint
```

### Root-level Make targets
```bash
make bootstrap   # ./scripts/bootstrap.sh — initial environment setup
make dev         # ./scripts/dev.sh — start all dev servers
make test        # ./scripts/test.sh — run all test suites
make lint        # ./scripts/lint.sh — run all linters
```
Note: the scripts in `scripts/` are placeholders and may need to be implemented.

## Architecture

### API-First Contract
The Django backend is the single source of truth for all domain models, permissions, and business rules. The Next.js apps are consumers of the REST API — they do not contain business logic. When making changes, model changes flow backend → frontend.

### Backend Domain Boundaries (`apps/backend/apps/`)
- `accounts` — custom `User` model (`AUTH_USER_MODEL = "accounts.User"`), JWT auth, owner verification (modeled separately from User)
- `common` — shared model mixins, `UyTopLocaleMiddleware`, `DefaultPageNumberPagination`
- `core` — health check, platform-wide API concerns
- `locations` — cities, districts, geospatial data
- `listings` — listings, images, amenities, owner lifecycle; PostGIS `PointField` for map-bounds queries
- `catalog` — company/project browsing (guest-accessible)
- `interactions` — favorites, recently viewed, saved searches, search alerts, contact clicks
- `moderation` — reports, moderation actions, audit trail

### Authentication
SimpleJWT with rotating refresh tokens. Access tokens default to 15 min, refresh tokens to 7 days. Token blacklisting is enabled after rotation. All REST endpoints default to `IsAuthenticated` — catalog and public browse endpoints explicitly relax this.

### Locale / i18n
Locale is resolved via `X-UyTop-Locale` header or `uytop_locale` cookie (handled by `UyTopLocaleMiddleware`). Default language is Uzbek (`uz`); supported: `uz`, `en`, `ru`. Auto-translation is off by default (`AUTO_TRANSLATION_ENABLED=false`). Frontend apps handle UI string i18n client-side.

### Database
PostgreSQL + PostGIS. The DB engine is `django.contrib.gis.db.backends.postgis` — PostGIS must be installed. All geospatial fields use `PointField`. Default page size is 20 via `DefaultPageNumberPagination`.

### Background Jobs
Celery with Redis as broker and result backend. `CELERY_TASK_ALWAYS_EAGER=true` can be set in dev to run tasks synchronously without a worker.

### Frontend
Both Next.js apps use the App Router (Next.js 15). Leaflet is used for map-based discovery. No shared package between `web` and `admin` is currently active — `packages/` contains placeholders.

## Key Configuration
- All secrets and runtime config are env vars; `config/settings/base.py` documents every variable with its default.
- OpenAPI docs powered by `drf-spectacular`; schema auto-generated, served at `/api/schema/`.
- Media storage via Cloudinary (later phases); FCM for push notifications (later phases).
