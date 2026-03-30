from django.conf import settings
from django.db import models


class TranslationState(models.TextChoices):
    NOT_REQUESTED = "not_requested", "Not requested"
    PENDING = "pending", "Pending"
    COMPLETED = "completed", "Completed"
    FAILED = "failed", "Failed"
    STALE = "stale", "Stale"


class TranslatableContentModel(models.Model):
    source_language = models.CharField(max_length=16, default=settings.UYTOP_DEFAULT_LANGUAGE)
    translation_state = models.CharField(
        max_length=32,
        choices=TranslationState.choices,
        default=TranslationState.NOT_REQUESTED,
    )
    translation_error = models.TextField(blank=True)
    translation_updated_at = models.DateTimeField(null=True, blank=True)
    translation_status_map = models.JSONField(default=dict, blank=True)

    class Meta:
        abstract = True
