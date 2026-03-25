# 04_ARCHITECTURE.md

## System Overview
UyTop is an API-first monorepo with three application surfaces:
- `apps/backend`: Django + DRF API, business rules, PostGIS-backed search, JWT auth, background task hooks
- `apps/mobile`: Flutter mobile client for buyer, renter, and owner workflows
- `apps/admin`: Next.js admin panel for moderation and operations

Supporting infrastructure:
- PostgreSQL + PostGIS for transactional and geospatial data
- Redis + Celery for background jobs and future notification pipelines
- Cloudinary for media storage in later phases
- Firebase Cloud Messaging (FCM) for push delivery in later phases

## Backend Domain Boundaries
- `accounts`: users, profile, owner verification, JWT auth, role helpers
- `common`: shared utilities, pagination, model mixins
- `core`: health check and platform-wide API concerns
- `locations`: cities, districts, nearby places
- `listings`: listings, images, amenities, map search, owner lifecycle
- `interactions`: favorites, recently viewed, saved searches, search alerts, contact clicks
- `moderation`: reports, moderation actions, audit trail

Deferred until later phases:
- `notifications`
- `analytics`
- billing and payment placeholders

## Data Flow
1. Mobile or admin authenticates against the backend with JWT.
2. Backend issues access + refresh tokens and resolves role-aware permissions.
3. Listing creation and edits flow through serializers and service helpers before persistence.
4. Public browse and map endpoints expose only approved listings to guests, while owners and admins can access broader states according to permissions.
5. Moderation actions and reports write to dedicated moderation models and audit records.

## Cross-Cutting Decisions
- API-first contracts are the source of truth for mobile and admin.
- PostGIS `PointField` is the canonical geospatial field for map bounds queries.
- Translation readiness is handled through stable enum keys, backend-readable labels, and client-side i18n for mobile/admin.
- Owner verification is modeled separately from `User` so the verification workflow can evolve independently.

## Legacy Note
The top-level repository is the only active implementation root. The nested `uytop/` directory is legacy planning material and should be retired after current work stabilizes.
