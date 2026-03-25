# AGENTS.md

## Project
UyTop - production-ready real estate marketplace with:
- Flutter mobile app
- Django + DRF backend
- PostgreSQL + PostGIS
- Next.js admin panel
- Redis + Celery
- Cloudinary
- Firebase Cloud Messaging (FCM)

## Source of truth
Use the UyTop product brief as the source of truth.
Do not invent unrelated features.
Keep implementation MVP-first, but production-oriented.

## Working rules
- Plan first before coding.
- Keep changes modular and maintainable.
- Use clean naming and stable folder structure.
- Do not hardcode secrets.
- Use `.env.example` files for every service.
- Do not skip validation, permissions, or auth rules.
- Do not create toy placeholders for critical features.
- If a feature is not fully implemented yet, create the correct architecture and clear TODO markers only where necessary.
- Reuse existing patterns once they are established.
- Stop and explain blockers instead of guessing.

## Delivery order
1. Docs and structure
2. Scaffolding
3. Backend foundation
4. Admin and mobile foundations
5. Review and cleanup
6. Feature phases

## Architecture expectations
- API-first design
- Monorepo layout
- Service/domain separation
- Translation-ready structure
- Role-based permissions
- Production-minded defaults
- Test foundation from early phase

## Done when
A task is done only if:
- code structure is clear
- setup instructions are updated if needed
- environment variables are documented
- naming is consistent
- the change matches the product brief
- basic validation or verification is included