# Backend

This app contains the Django + DRF API foundation for UyTop.

Current scope:
- Django project scaffold
- split settings for local, test, and production
- DRF and drf-spectacular starter
- JWT-ready authentication structure
- PostgreSQL/PostGIS-ready database settings
- Redis and Celery-ready configuration
- health check endpoint
- Docker-ready backend container
- modular app boundaries for accounts, common, core, locations, listings, interactions, and moderation
- listing CRUD, map discovery, favorites, recently viewed, saved searches, reports, and admin moderation foundations

Current domain apps:
- `common`: shared abstract models
- `core`: platform-level endpoints such as health checks
- `accounts`: custom user, profile, owner verification, JWT auth endpoints, and role foundation
- `locations`: city, district, and nearby place models
- `listings`: listing lifecycle, images, amenities, and map query support
- `interactions`: favorites, recently viewed, saved searches, and contact logs
- `moderation`: reports, moderation actions, and audit logs

Out of scope for this phase:
- Cloudinary upload flow
- FCM delivery
- owner analytics
- mortgage calculator
- subscriptions and payments
