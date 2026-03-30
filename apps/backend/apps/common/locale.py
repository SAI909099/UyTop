from django.conf import settings
from django.utils import translation


def get_supported_languages() -> tuple[str, ...]:
    return tuple(code for code, _ in settings.LANGUAGES)


def normalize_language(value: str | None, *, fallback_to_default: bool = True) -> str:
    if not value:
        return settings.UYTOP_DEFAULT_LANGUAGE if fallback_to_default else ""

    normalized = value.strip().lower().replace("_", "-")
    if normalized in get_supported_languages():
        return normalized

    short = normalized.split("-", 1)[0]
    if short in get_supported_languages():
        return short

    return settings.UYTOP_DEFAULT_LANGUAGE if fallback_to_default else ""


def resolve_request_language(request) -> str:
    user_preferred_language = ""
    if getattr(request, "user", None) and request.user.is_authenticated and hasattr(request.user, "profile"):
        user_preferred_language = getattr(request.user.profile, "preferred_language", "")

    candidates = (
        request.query_params.get("locale") if hasattr(request, "query_params") else request.GET.get("locale"),
        request.headers.get(settings.UYTOP_LOCALE_HEADER),
        request.COOKIES.get(settings.UYTOP_LOCALE_COOKIE_NAME),
        user_preferred_language,
        getattr(request, "LANGUAGE_CODE", ""),
        translation.get_language(),
        settings.UYTOP_DEFAULT_LANGUAGE,
    )
    for candidate in candidates:
        if not candidate:
            continue
        normalized = normalize_language(candidate, fallback_to_default=False)
        if normalized:
            return normalized

    return settings.UYTOP_DEFAULT_LANGUAGE


def get_request_language(request=None) -> str:
    if request is not None and hasattr(request, "uytop_language"):
        return request.uytop_language
    return normalize_language(translation.get_language())
