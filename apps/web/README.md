# Web

This app contains the public homepage for UyTop.

Current scope:
- premium dark cinematic homepage
- live backend-driven companies, projects, and map apartments
- interactive Leaflet map
- developer hub route at `/developers`
- project hub route at `/projects`
- apartment comparison route at `/compare?slugs=...`
- cinematic building detail route at `/projects/[projectSlug]/buildings/[buildingSlug]`
- public apartment detail route at `/apartments/[slug]`
- no broader public browse routes yet beyond `/`, `/map`, `/developers`, `/projects`, `/compare`, apartment detail, and building detail

Run locally:
- create `.env.local` from `.env.example`
- install dependencies
- run `npm run dev`
