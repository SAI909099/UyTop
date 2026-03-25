# UyTop

UyTop is a production-ready real estate marketplace with interactive map-based property discovery.

## Stack
- Mobile: Flutter
- Backend: Django + Django REST Framework
- Database: PostgreSQL + PostGIS
- Admin: Next.js
- Background jobs: Redis + Celery
- Storage: Cloudinary
- Push notifications: Firebase Cloud Messaging (FCM)

## Main product goals
- map-based property discovery
- listings for sale and rent
- owner-managed listings
- admin moderation and anti-fraud
- favorites, saved searches, recently viewed
- owner analytics
- multilingual foundation
- future-ready public web expansion

## Repository structure
```text
/uytop
  /apps
    /mobile
    /admin
    /backend
  /packages
  /docs
  /infra
  /scripts
```

## Current status
- the top-level repository is the active monorepo root
- the canonical project docs live in `docs/`
- the nested `uytop/` directory is legacy planning material and should not be used as the implementation root

## Local foundation
- backend foundation: Django + DRF project structure with split settings
- mobile foundation: Flutter app shell with routing and API layer boundaries
- admin foundation: Next.js app shell with protected layout starter

Detailed environment and run instructions still need to be completed in the next phase.
