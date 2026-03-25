# 13_ENV_VARIABLES.md

## Root
- `PROJECT_NAME`
- `ENVIRONMENT`

## Backend
- `DJANGO_SETTINGS_MODULE`
- `SECRET_KEY`
- `DEBUG`
- `ALLOWED_HOSTS`
- `CSRF_TRUSTED_ORIGINS`
- `TIME_ZONE`
- `POSTGRES_DB`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_HOST`
- `POSTGRES_PORT`
- `REDIS_URL`
- `JWT_ACCESS_TOKEN_MINUTES`
- `JWT_REFRESH_TOKEN_DAYS`
- `CELERY_TASK_ALWAYS_EAGER`
- `CELERY_TASK_TIME_LIMIT`
- `CELERY_TASK_SOFT_TIME_LIMIT`

## Admin
- `NEXT_PUBLIC_API_BASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL`
- `ADMIN_BYPASS_AUTH`

## Mobile
- `API_BASE_URL`
- `APP_ENV`

## Infra Notes
- Docker Compose currently consumes `infra/env/backend.env.example` for backend/database defaults.
- service-specific `.env.example` files in each app remain the developer-facing source of reference.
