# CHECKLIST

## Public Homepage Delivery
- [x] Recreated `apps/web` as a separate Next.js application
- [x] Implemented a premium dark cinematic `/` homepage with map-first composition
- [x] Wired live backend data from `catalog/companies`, `catalog/projects`, and `catalog/map/apartments`
- [x] Preserved the existing `NEXT_PUBLIC_API_BASE_URL` env pattern for public data access
- [x] Added subtle motion, layered depth, and `prefers-reduced-motion` handling
- [x] Included empty states for missing companies, projects, and map inventory
- [x] Added a filter-driven homepage project discovery section under the stats strip with active chips, sort controls, and live project results
- [x] Added backend-backed pagination for homepage project filter results at 20 launches per page
- [x] Expanded homepage project filters with address search and room-count matching against live apartment inventory
- [x] Replaced the static homepage story block with a live apartment showcase that reacts to the same discovery filters
- [x] Reworked the homepage verified-developers section into a moving horizontal brand rail
- [x] Updated repo docs to reflect the restored public web app
- [x] Verified `npm run build` passes in `apps/web`
- [x] Verified `npm run build` still passes in `apps/admin`

## Homepage Map Optimization
- [x] Moved the homepage map experience to an explicit on-demand reveal instead of mounting it on first load
- [x] Added homepage CTA entry points for `Show map` and `Turn on location`
- [x] Reused the dedicated `/map` page as the full live-map experience with a `Near me` control
- [x] Added inline browser geolocation feedback and user-location highlighting on the full map page
- [x] Routed browser-side public catalog fetches through a same-origin Next proxy so homepage map preview no longer falls back to false empty state
- [x] Added district-aware far zoom counts, 2-3 km nearby grouping at mid zoom, and preserved exact home markers at close zoom
