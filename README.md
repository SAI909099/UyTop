# UyTop

UyTop is a real estate platform repository with backend services, a premium public web homepage, and admin operations.

## Stack
- Backend: Django + Django REST Framework
- Public web: Next.js
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
- stable backend contracts for public web, admin, and future client integrations

## Repository structure
```text
/uytop
  /apps
    /admin
    /backend
    /web
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
- public web foundation: Next.js homepage with live map, company, and project surfaces
- admin foundation: Next.js app shell with protected layout starter
- multilingual content foundation: locale-aware catalog/listing APIs plus Uzbek, English, and Russian content storage for uploaded real-estate records

Detailed environment and run instructions still need to be completed in the next phase.
