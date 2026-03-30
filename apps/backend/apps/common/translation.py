import html
import json
from copy import deepcopy
from urllib import error, parse, request

from celery import shared_task
from django.apps import apps
from django.conf import settings
from django.db.models import Q
from django.utils import timezone

from apps.common.locale import get_supported_languages, normalize_language
from apps.common.models import TranslationState


TRANSLATION_STATUS_MACHINE = "machine"
TRANSLATION_STATUS_MANUAL = "manual"
TRANSLATION_STATUS_STALE = "stale"


class TranslationProviderError(Exception):
    pass


def get_translation_field_name(field_name: str) -> str:
    return f"{field_name}_translations"


def get_translatable_fields(instance_or_class) -> tuple[str, ...]:
    return tuple(getattr(instance_or_class, "TRANSLATABLE_FIELDS", ()))


def get_field_translations(instance, field_name: str) -> dict[str, str]:
    value = getattr(instance, get_translation_field_name(field_name), {}) or {}
    if not isinstance(value, dict):
        return {}
    return {
        normalize_language(locale, fallback_to_default=False): text or ""
        for locale, text in value.items()
        if isinstance(locale, str) and normalize_language(locale, fallback_to_default=False)
    }


def set_field_translations(instance, field_name: str, translations: dict[str, str]) -> None:
    cleaned = {
        normalize_language(locale, fallback_to_default=False): value or ""
        for locale, value in translations.items()
        if isinstance(locale, str) and normalize_language(locale, fallback_to_default=False) in get_supported_languages()
    }
    setattr(instance, get_translation_field_name(field_name), cleaned)


def serialize_translations(instance, *, fields: tuple[str, ...] | None = None) -> dict[str, dict[str, str]]:
    resolved_fields = fields or get_translatable_fields(instance)
    return {field_name: get_field_translations(instance, field_name) for field_name in resolved_fields}


def get_localized_value(instance, field_name: str, language: str | None = None) -> str:
    resolved_language = normalize_language(language or getattr(instance, "source_language", None))
    fallback_language = normalize_language(getattr(instance, "source_language", None))
    translations = get_field_translations(instance, field_name)
    value = translations.get(resolved_language) or translations.get(fallback_language) or getattr(instance, field_name, "")
    return value or ""


def build_localized_text_query(field_path: str, language: str, value: str) -> Q:
    parts = field_path.split("__")
    translated_lookup = "__".join([*parts[:-1], get_translation_field_name(parts[-1]), normalize_language(language), "icontains"])
    source_lookup = "__".join([*parts, "icontains"])
    return Q(**{translated_lookup: value}) | Q(**{source_lookup: value})


def _clean_translation_status_map(status_map: dict) -> dict[str, dict[str, str]]:
    cleaned: dict[str, dict[str, str]] = {}
    for field_name, locale_statuses in (status_map or {}).items():
        if not isinstance(locale_statuses, dict):
            continue
        field_cleaned = {
            normalize_language(locale, fallback_to_default=False): status
            for locale, status in locale_statuses.items()
            if normalize_language(locale, fallback_to_default=False) and status in {
                TRANSLATION_STATUS_MACHINE,
                TRANSLATION_STATUS_MANUAL,
                TRANSLATION_STATUS_STALE,
            }
        }
        if field_cleaned:
            cleaned[field_name] = field_cleaned
    return cleaned


def compute_translation_state(instance) -> str:
    if getattr(instance, "translation_error", ""):
        return TranslationState.FAILED

    status_map = _clean_translation_status_map(getattr(instance, "translation_status_map", {}))
    source_language = normalize_language(getattr(instance, "source_language", None))
    has_source_content = False
    has_pending = False
    has_stale = False

    for field_name in get_translatable_fields(instance):
        source_value = (getattr(instance, field_name, "") or "").strip()
        if not source_value:
            continue

        has_source_content = True
        translations = get_field_translations(instance, field_name)
        locale_statuses = status_map.get(field_name, {})
        for locale in get_supported_languages():
            if locale == source_language:
                continue

            if locale_statuses.get(locale) == TRANSLATION_STATUS_STALE:
                has_stale = True
                continue

            if not (translations.get(locale) or "").strip():
                has_pending = True

    if has_stale:
        return TranslationState.STALE
    if has_pending:
        return TranslationState.PENDING if settings.AUTO_TRANSLATION_ENABLED else TranslationState.NOT_REQUESTED
    if has_source_content:
        return TranslationState.COMPLETED
    return TranslationState.NOT_REQUESTED


def apply_translatable_updates(
    instance,
    *,
    source_language: str | None = None,
    source_values: dict[str, str] | None = None,
    translations_payload: dict[str, dict[str, str]] | None = None,
) -> list[str]:
    resolved_source_language = normalize_language(source_language or getattr(instance, "source_language", None))
    changed_fields: list[str] = []
    status_map = deepcopy(getattr(instance, "translation_status_map", {}) or {})
    source_values = source_values or {}
    translations_payload = translations_payload or {}

    for field_name in get_translatable_fields(instance):
        if field_name in source_values:
            next_value = source_values[field_name] or ""
            if getattr(instance, field_name, "") != next_value:
                changed_fields.append(field_name)
            setattr(instance, field_name, next_value)

        current_value = getattr(instance, field_name, "") or ""
        field_translations = get_field_translations(instance, field_name)
        field_translations[resolved_source_language] = current_value
        field_statuses = status_map.get(field_name, {})

        payload = translations_payload.get(field_name, {})
        if isinstance(payload, dict):
            for locale, text in payload.items():
                normalized_locale = normalize_language(locale, fallback_to_default=False)
                if not normalized_locale:
                    continue
                if normalized_locale == resolved_source_language:
                    continue

                field_translations[normalized_locale] = text or ""
                if (text or "").strip():
                    field_statuses[normalized_locale] = TRANSLATION_STATUS_MANUAL
                else:
                    field_statuses.pop(normalized_locale, None)

        if field_name in changed_fields and current_value.strip():
            for locale in get_supported_languages():
                if locale == resolved_source_language:
                    continue

                existing_status = field_statuses.get(locale, "")
                if existing_status == TRANSLATION_STATUS_MANUAL:
                    field_statuses[locale] = TRANSLATION_STATUS_STALE
                elif existing_status != TRANSLATION_STATUS_STALE:
                    field_statuses[locale] = TRANSLATION_STATUS_MACHINE

        status_map[field_name] = field_statuses
        set_field_translations(instance, field_name, field_translations)

    instance.source_language = resolved_source_language
    instance.translation_status_map = _clean_translation_status_map(status_map)
    instance.translation_error = ""
    instance.translation_state = compute_translation_state(instance)
    return changed_fields


def _build_model_update_fields(instance, field_names: list[str]) -> list[str]:
    available = {field.name for field in instance._meta.fields}
    return [field_name for field_name in field_names if field_name in available]


def _translate_text(text: str, *, source_language: str, target_language: str) -> str:
    provider = (settings.TRANSLATION_PROVIDER or "").strip().lower()
    if provider == "dummy":
        return f"[{target_language}] {text}"
    if provider != "google":
        raise TranslationProviderError(f"Unsupported translation provider: {provider or 'unset'}")
    if not settings.GOOGLE_TRANSLATE_API_KEY:
        raise TranslationProviderError("GOOGLE_TRANSLATE_API_KEY is required for Google translation.")

    payload = parse.urlencode(
        {
            "key": settings.GOOGLE_TRANSLATE_API_KEY,
            "q": text,
            "source": source_language,
            "target": target_language,
            "format": "text",
        }
    )
    upstream_request = request.Request(
        f"https://translation.googleapis.com/language/translate/v2?{payload}",
        headers={"Accept": "application/json"},
    )

    try:
        with request.urlopen(upstream_request, timeout=settings.TRANSLATION_TIMEOUT_SECONDS) as upstream_response:
            response_payload = json.loads(upstream_response.read().decode("utf-8"))
    except error.URLError as exc:
        raise TranslationProviderError(str(exc)) from exc

    try:
        translated_text = response_payload["data"]["translations"][0]["translatedText"]
    except (KeyError, IndexError, TypeError) as exc:
        raise TranslationProviderError("Unexpected translation provider response.") from exc

    return html.unescape(translated_text)


def translate_instance_fields(instance, fields: list[str] | tuple[str, ...] | None = None) -> None:
    resolved_fields = [
        field_name
        for field_name in (fields or get_translatable_fields(instance))
        if field_name in get_translatable_fields(instance)
    ]
    if not resolved_fields:
        return

    status_map = deepcopy(getattr(instance, "translation_status_map", {}) or {})
    source_language = normalize_language(getattr(instance, "source_language", None))

    for field_name in resolved_fields:
        source_value = (getattr(instance, field_name, "") or "").strip()
        if not source_value:
            continue

        field_translations = get_field_translations(instance, field_name)
        field_translations[source_language] = getattr(instance, field_name, "") or ""
        field_statuses = status_map.get(field_name, {})

        for locale in get_supported_languages():
            if locale == source_language:
                continue

            status = field_statuses.get(locale, "")
            if status in {TRANSLATION_STATUS_MANUAL, TRANSLATION_STATUS_STALE}:
                continue

            field_translations[locale] = _translate_text(
                source_value,
                source_language=source_language,
                target_language=locale,
            )
            field_statuses[locale] = TRANSLATION_STATUS_MACHINE

        status_map[field_name] = field_statuses
        set_field_translations(instance, field_name, field_translations)

    instance.translation_status_map = _clean_translation_status_map(status_map)
    instance.translation_error = ""
    instance.translation_updated_at = timezone.now()
    instance.translation_state = compute_translation_state(instance)
    instance.save(
        update_fields=_build_model_update_fields(
            instance,
            [get_translation_field_name(field_name) for field_name in resolved_fields]
            + [
                "translation_status_map",
                "translation_error",
                "translation_updated_at",
                "translation_state",
                "updated_at",
            ],
        )
    )


@shared_task
def translate_model_fields_task(app_label: str, model_name: str, object_id: int, fields: list[str]):
    model = apps.get_model(app_label, model_name)
    instance = model._default_manager.get(pk=object_id)

    try:
        translate_instance_fields(instance, fields)
    except TranslationProviderError as exc:
        instance.translation_error = str(exc)
        instance.translation_state = TranslationState.FAILED
        instance.save(
            update_fields=_build_model_update_fields(
                instance,
                ["translation_error", "translation_state", "updated_at"],
            )
        )
        raise


def queue_model_translation(instance, changed_fields: list[str]) -> None:
    resolved_fields = [
        field_name
        for field_name in changed_fields
        if field_name in get_translatable_fields(instance) and (getattr(instance, field_name, "") or "").strip()
    ]
    if not resolved_fields:
        instance.translation_state = compute_translation_state(instance)
        instance.save(update_fields=_build_model_update_fields(instance, ["translation_state", "updated_at"]))
        return

    if not settings.AUTO_TRANSLATION_ENABLED:
        instance.translation_state = compute_translation_state(instance)
        instance.save(update_fields=_build_model_update_fields(instance, ["translation_state", "updated_at"]))
        return

    instance.translation_error = ""
    instance.translation_state = TranslationState.PENDING
    instance.save(
        update_fields=_build_model_update_fields(
            instance,
            ["translation_error", "translation_state", "updated_at"],
        )
    )
    translate_model_fields_task.delay(
        instance._meta.app_label,
        instance.__class__.__name__,
        instance.pk,
        resolved_fields,
    )
