from django.conf import settings
from rest_framework import serializers

from apps.common.locale import get_request_language, get_supported_languages, normalize_language
from apps.common.translation import get_localized_value, serialize_translations


class LocalizedModelSerializerMixin:
    def get_localized_fields(self) -> tuple[str, ...]:
        meta = getattr(self, "Meta", None)
        return tuple(getattr(meta, "localized_fields", ()))

    def to_representation(self, instance):
        data = super().to_representation(instance)
        localized_fields = self.get_localized_fields()
        if not localized_fields:
            return data

        language = get_request_language(self.context.get("request"))
        for field_name in localized_fields:
            data[field_name] = get_localized_value(instance, field_name, language)

        data["source_language"] = instance.source_language
        data["translations"] = serialize_translations(instance, fields=localized_fields)
        data["translation_state"] = instance.translation_state
        data["translation_status_map"] = instance.translation_status_map
        data["translation_updated_at"] = instance.translation_updated_at
        data["translation_error"] = instance.translation_error
        return data


class TranslatableWriteSerializerMixin(serializers.Serializer):
    source_language = serializers.ChoiceField(
        choices=[(code, code) for code in get_supported_languages()],
        required=False,
    )
    translations = serializers.DictField(required=False, default=dict, write_only=True)

    def get_translatable_fields(self) -> tuple[str, ...]:
        meta = getattr(self, "Meta", None)
        localized_fields = tuple(getattr(meta, "localized_fields", ()))
        if localized_fields:
            return localized_fields
        return tuple(getattr(meta, "translatable_fields", ()))

    def validate_translations(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Translations must be an object keyed by field name.")

        supported_languages = set(get_supported_languages())
        cleaned: dict[str, dict[str, str]] = {}
        for field_name, field_translations in value.items():
            if field_name not in self.get_translatable_fields():
                raise serializers.ValidationError({field_name: "Unknown translated field."})
            if not isinstance(field_translations, dict):
                raise serializers.ValidationError({field_name: "Expected an object keyed by locale."})

            cleaned[field_name] = {}
            for locale, text in field_translations.items():
                normalized_locale = normalize_language(locale, fallback_to_default=False)
                if normalized_locale not in supported_languages:
                    raise serializers.ValidationError({field_name: f"Unsupported locale: {locale}."})
                if not isinstance(text, str):
                    raise serializers.ValidationError({field_name: f"Translation for {locale} must be a string."})
                cleaned[field_name][normalized_locale] = text

        return cleaned

    def pop_translation_controls(self, validated_data):
        source_language = normalize_language(
            validated_data.pop(
                "source_language",
                getattr(getattr(self, "instance", None), "source_language", settings.UYTOP_DEFAULT_LANGUAGE),
            )
        )
        translations = validated_data.pop("translations", {})
        source_values = {}
        for field_name in self.get_translatable_fields():
            if field_name in validated_data:
                source_values[field_name] = validated_data.pop(field_name)
        return source_language, translations, source_values
