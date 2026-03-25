# 05_DATABASE_SCHEMA.md

## Accounts
- `User`
  - custom auth model
  - roles: `user`, `owner`, `admin`
  - unique `email`
  - unique `phone_number`
- `UserProfile`
  - one-to-one with `User`
  - preferred language
  - city/district display fields
- `OwnerVerification`
  - one-to-one with `User`
  - verification status, reviewer, notes, timestamps

## Locations
- `LocationCity`
  - name, slug, country code, active flag
- `LocationDistrict`
  - city foreign key
  - name, slug, active flag
- `NearbyPlace`
  - listing foreign key
  - place type, title, distance_meters

## Listings
- `Listing`
  - owner foreign key
  - purpose: `sale`, `rent`
  - category: `house`, `apartment`, `land`, `commercial`
  - status: `draft`, `active`, `archived`, `sold`, `rented`
  - moderation status: `draft`, `pending_review`, `approved`, `rejected`
  - slug, title, description, price, currency
  - address, city foreign key, district foreign key
  - latitude, longitude, `location_point`
  - rooms, size_sqm, condition, furnished
  - floor, total_floors
  - contact options and handles
  - `is_featured`, `is_verified_owner`, `view_count`
  - `published_at`, `expires_at`, `sold_or_rented_at`
- `ListingImage`
  - listing foreign key
  - `image_url`, `storage_key`
  - `sort_order`, `is_primary`
- `Amenity`
  - title, slug, active flag
- `ListingAmenity`
  - listing foreign key
  - amenity foreign key

## Interactions
- `Favorite`
  - unique per user + listing
- `RecentlyViewed`
  - unique per user + listing
  - `last_viewed_at`
- `SavedSearch`
  - explicit filter columns for MVP
  - alerts enabled flag
- `SearchAlert`
  - saved search foreign key
  - triggered listing foreign key
  - sent flag and timestamps
- `ContactClickLog`
  - listing foreign key
  - optional user foreign key
  - channel and source

## Moderation
- `ListingReport`
  - listing foreign key
  - reporter foreign key
  - reason enum + details
  - status
- `ModerationAction`
  - listing foreign key
  - optional report foreign key
  - actor foreign key
  - action enum + notes + metadata
- `AuditLog`
  - actor foreign key
  - action
  - target model + target id
  - metadata JSON

## Index Strategy
- listings:
  - GIST index on `location_point`
  - composite indexes on moderation status, status, purpose, category
  - indexes on city, district, price, published_at, created_at, is_featured
- interactions:
  - unique constraints for favorites and recently viewed
  - user/date indexes for saved search and search alert processing
- moderation:
  - indexes on report status and moderation action timestamps
