# 06_API_SPEC.md

## Auth
- `POST /api/auth/register`
- `POST /api/auth/token`
- `POST /api/auth/token/refresh`
- `POST /api/auth/token/blacklist`
- `GET /api/auth/me`
- `PUT /api/auth/me`

Login accepts email or phone through a single identifier field.

## Listings
- `GET /api/listings`
- `POST /api/listings`
- `GET /api/listings/{id}`
- `PUT /api/listings/{id}`
- `DELETE /api/listings/{id}`
- `PATCH /api/listings/{id}/submit-for-review`
- `PATCH /api/listings/{id}/mark-sold`
- `PATCH /api/listings/{id}/mark-rented`

## Map Search
- `GET /api/map/listings`
  - required bounds params: `north`, `south`, `east`, `west`
  - supports the same listing filters as list endpoints

## Interactions
- `POST /api/favorites/{listing_id}`
- `DELETE /api/favorites/{listing_id}`
- `GET /api/favorites`
- `GET /api/recently-viewed`
- `GET /api/saved-searches`
- `POST /api/saved-searches`

## Moderation
- `POST /api/reports`
- `GET /api/admin/listings/pending`
- `PATCH /api/admin/listings/{id}/approve`
- `PATCH /api/admin/listings/{id}/reject`
- `GET /api/admin/reports`

## Conventions
- authentication:
  - JWT bearer token
- pagination:
  - page-number pagination
  - `page` query param
- filtering:
  - explicit query params for purpose, category, city, district, price ranges, rooms, size, furnished, featured, verified, sort
- errors:
  - DRF validation payloads for field-level errors
  - `detail` for general permission/auth errors
