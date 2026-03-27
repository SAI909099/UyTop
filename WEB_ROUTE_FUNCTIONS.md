# Web Route Functions Inventory

Last updated: 2026-03-27

This file tracks the public `3000` routes, the components/functions they depend on, and the latest design/system changes. Update the relevant entry after every customer-facing web change.

## Shared public shell

- Components:
  - `apps/web/src/components/layout/site-header.tsx`
  - `apps/web/src/components/layout/site-footer.tsx`
  - `apps/web/src/components/ui/button.tsx`
  - `apps/web/src/components/ui/premium-card.tsx`
  - `apps/web/src/components/ui/section-heading.tsx`
  - `apps/web/src/components/ui/chip.tsx`
- Design/system notes:
  - Shared ivory / deep navy / soft-gold visual system
  - Inter body font direction with Montserrat display emphasis
  - Shared card, button, chip, shell, and spacing rules live in `apps/web/src/app/globals.css`
- Last changes:
  - 2026-03-25: Applied luxury redesign foundation across the public shell and aligned header/footer/navigation to the new route set.

## `/`

- Page purpose:
  - Premium landing page for developer-led residential discovery.
- Components used:
  - `AvailabilitySummary`
  - `BuildingCard`
  - `DeveloperCard`
  - `ProjectCard`
  - `StylizedMap`
  - `VerifiedBadge`
  - `ButtonLink`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getCatalogDevelopers`
  - `getCatalogFeaturedDeveloper`
  - `getCatalogFeaturedProject`
  - `getCompanyApartmentsLeft`
  - `getCompanyMapPins`
  - `formatCompactNumber`
  - `getDeveloperHref`
  - `getProjectHref`
- Design/system notes:
  - Hero-driven luxury landing layout with developer-first hierarchy and branded trust framing.
- Last changes:
  - 2026-03-25: Added a four-card market snapshot strip so the landing page reads like a premium discovery dashboard, not only a marketing hero.

## `/developers`

- Page purpose:
  - Developer listing page for brand-level portfolio comparison.
- Components used:
  - `DeveloperCard`
  - `VerifiedBadge`
  - `ButtonLink`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getCatalogDevelopers`
  - `getCatalogFeaturedDeveloper`
  - `getDeveloperHref`
- Design/system notes:
  - Dark premium directory view with glass search, segmented filters, and trust-first comparison cards tied to the shared public shell.
- Last changes:
  - 2026-03-27: Replaced the placeholder listing concept with a live-data Developer Hub route that derives experience from company detail payloads and filters the roster by search, region, and portfolio buckets.

## `/developers/[companySlug]`

- Page purpose:
  - Developer profile page showing brand identity, trust, metrics, map, and projects.
- Components used:
  - `AvailabilitySummary`
  - `BrandHero`
  - `ProjectCard`
  - `StylizedMap`
  - `VerifiedBadge`
  - `ButtonLink`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getCatalogDeveloperBySlug`
  - `getCompanyApartmentsLeft`
  - `getCompanyMapPins`
  - `getCompanyProjectCount`
  - `formatCompactNumber`
  - `getProjectHref`
- Design/system notes:
  - Company profile layout stays feature-compatible but now inherits the shared luxury treatment.
- Last changes:
  - 2026-03-25: Added a company snapshot strip for headquarters, flagship project, delivery scale, and visible apartment inventory.

## `/projects`

- Page purpose:
  - Canonical public directory for browsing and filtering live residential launches.
- Components used:
  - `ProjectHub`
  - `HomePrimaryNav`
- Key helper/API functions:
  - `getPublicProjects`
  - `getPublicCompaniesPage`
  - `getPublicCatalogLookups`
  - `formatCurrency`
  - `formatCompactNumber`
  - `formatRooms`
- Design/system notes:
  - The route mirrors the Developer Hub rhythm but shifts the focus to launch comparison, with a serif hero, premium filter shell, and live project cards kept informational in v1 rather than routing into an unfinished detail page.
- Last changes:
  - 2026-03-27: Added a standalone `/projects` hub with search, developer and region filters, price and delivery controls, room-match refinement, and canonical navigation from the shared header and homepage CTAs.

## `/compare`

- Page purpose:
  - Shareable apartment comparison route for side-by-side decision support across live public units.
- Components used:
  - `ApartmentComparisonMatrix`
  - `HomePrimaryNav`
- Key helper/API functions:
  - `getPublicApartmentDetail`
  - `getPublicBuildings`
  - `formatCurrency`
  - `formatRooms`
  - `formatLabel`
- Design/system notes:
  - The page shifts the public UI into a cleaner matrix mode with sticky metric labels, thumbnail-led apartment columns, subtle sort controls, and a single gold “best value per sqm” highlight when currencies match.
- Last changes:
  - 2026-03-27: Added a live-data comparison matrix route at `/compare?slugs=...` with up to four apartments, client-side column sorting, delivery values derived from building summaries, and premium empty/error states.

## `/projects/[projectSlug]`

- Page purpose:
  - Project overview page for gallery, overview, map, building cards, and availability.
- Components used:
  - `AvailabilitySummary`
  - `BrandHero`
  - `BuildingCard`
  - `StylizedMap`
  - `VerifiedBadge`
  - `ButtonLink`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getCatalogProjectBySlug`
  - `getProjectApartmentCount`
  - `getProjectApartmentsLeft`
  - `formatCurrency`
  - `getDeveloperHref`
  - `getBuildingHref`
- Design/system notes:
  - Project pages use the same shell/card rhythm as the rest of the public experience.
- Last changes:
  - 2026-03-25: Added a project overview strip highlighting address, delivery window, entry pricing, and release-block count.

## `/projects/[projectSlug]/buildings/[buildingSlug]`

- Page purpose:
  - Cinematic building detail page for floor exploration, stylized technical diagrams, live unit availability, and a sticky price sidebar.
- Components used:
  - `BuildingDetailView`
  - `BuildingFloorExplorer`
  - `HomePrimaryNav`
- Key helper/API functions:
  - `getPublicBuildingDetail`
  - `formatCurrency`
  - `formatLabel`
  - route-level project/building slug validation
- Design/system notes:
  - The page shifts the public experience toward a darker, more architectural presentation, with the hero media carrying the cinematic weight and the split layout keeping floor interaction and pricing visible at the same time.
- Last changes:
  - 2026-03-27: Added a live-data building route with a dusk hero, floor-selector slider, technical diagram treatment, unit list, and sticky price-and-availability card.

## `/apartments`

- Page purpose:
  - Apartment-map discovery route with live pins and selected-apartment rail.
- Components used:
  - `ApartmentMapExperience`
  - `ButtonLink`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getCatalogApartmentMap`
  - `getCatalogFeaturedDeveloper`
  - `formatCurrency`
- Design/system notes:
  - Map browsing now sits inside the same luxury shell instead of feeling like a standalone utility page.
- Last changes:
  - 2026-03-25: Added a route-level map snapshot strip for pin count, developer coverage, project coverage, and visible entry pricing.

## `/apartments/[slug]`

- Page purpose:
  - Individual apartment detail page for the live catalog inventory.
- Components used:
  - `ApartmentDetailView`
  - `ApartmentLocationMap`
  - `HomePrimaryNav`
- Key helper/API functions:
  - `getPublicApartmentDetail`
  - `formatCurrency`
  - `formatRooms`
  - `formatLabel`
- Design/system notes:
  - Uses the same dark cinematic shell as the homepage, but shifts from map discovery into a quiet-luxury single-residence narrative with gallery, snapshot strip, financing notes, and an exact location map.
- Last changes:
  - 2026-03-27: Added a live-data apartment detail route with gallery fallback handling, payment-option cards, location map, and links from the homepage showcase and map overlay into the standalone detail page.

## `/properties/[slugOrId]`

- Page purpose:
  - Individual property detail page for legacy listing inventory.
- Components used:
  - `ListingCard`
  - `MapPanel`
  - `ButtonLink`
  - `Chip`
  - `PremiumCard`
- Key helper/API functions:
  - `getFeaturedListings`
  - `getListingDetail`
  - `formatCurrency`
  - `formatDistance`
  - `titleize`
  - `getPropertyIdFromParam`
- Design/system notes:
  - Legacy listing detail must visually match the newer developer-led routes, even though its data model is separate.
- Last changes:
  - 2026-03-25: Added a legacy-detail snapshot strip so category, neighborhood, moderation status, and contact-channel readiness feel integrated with the new luxury system.

## `/search`

- Page purpose:
  - Legacy listing search route with filter form, result cards, and map panel.
- Components used:
  - `ListingCard`
  - `MapPanel`
  - `Button`
  - `Chip`
  - `PremiumCard`
  - `SectionHeading`
- Key helper/API functions:
  - `getSearchListings`
  - `getMapListings`
  - local `buildQueryString`
- Design/system notes:
  - Search keeps its current responsibilities but must no longer look like a different product.
- Last changes:
  - 2026-03-25: Added a premium intro, route-level stat board, and results banner so legacy search now feels like part of the same product family.

## Out of scope

- `/owner/dashboard`
  - Lives on port `3000` but is intentionally excluded from this public-customer redesign pass.
