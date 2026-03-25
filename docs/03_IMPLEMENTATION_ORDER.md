# 03_IMPLEMENTATION_ORDER.md

## Phase 0 - planning
- confirm scope
- create docs
- define repo structure
- define app boundaries
- define naming conventions
- define environment strategy

## Phase 1 - foundation
- create monorepo folders
- scaffold backend Django project
- scaffold Flutter app
- scaffold Next.js admin
- add Docker/dev setup
- add `.env.example` files
- add README files
- add API docs starter
- add base auth structure
- add initial core domain models

## Phase 2 - backend core
- custom user/profile
- role model/permissions
- listings domain
- listing images/amenities
- favorites
- recently viewed
- saved searches
- moderation/reporting models
- base serializers/services/views
- auth endpoints
- listing CRUD endpoints
- map query endpoints

## Phase 3 - admin panel core
- admin auth shell
- dashboard layout
- moderation queue page
- reports page
- users/owners list views
- role guards
- reusable table/filter components

## Phase 4 - mobile core
- app structure
- routing
- auth screens
- home map/list shell
- listing details
- favorites
- profile
- my listings
- add/edit/draft listing flows

## Phase 5 - integrations
- Cloudinary upload flow
- FCM foundations
- Celery tasks
- notifications base logic

## Phase 6 - quality
- backend unit/API test foundation
- admin test foundation
- Flutter test foundation
- seed data
- docs cleanup
- production-readiness review

## Rule
Do not jump to advanced features before Phase 1 and Phase 2 are stable.
