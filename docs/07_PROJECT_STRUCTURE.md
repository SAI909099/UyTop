# 07_PROJECT_STRUCTURE.md

## Active Repository Layout
```text
/uytop
  /apps
    /backend
    /mobile
    /admin
    /web
  /docs
  /infra
  /packages
  /scripts
```

## Ownership
- `apps/backend`: source of truth for domain models, permissions, and API contracts
- `apps/mobile`: Flutter client and UI-specific state
- `apps/admin`: admin workflows and operational interfaces
- `apps/web`: public marketplace website and owner-facing web shell
- `docs`: canonical product and architecture documentation
- `infra`: Docker and env templates
- `packages`: future shared contracts and tokens

## Naming Rules
- backend Django apps use domain names: `accounts`, `locations`, `listings`, `interactions`, `moderation`
- top-level repo folder names remain `backend`, `mobile`, and `admin`
- the nested `uytop/` folder is legacy and should not receive new implementation work
