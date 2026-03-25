from django.db import models

from apps.common.models import TimeStampedModel


class ListingReportReason(models.TextChoices):
    FAKE = "fake", "Fake"
    DUPLICATE = "duplicate", "Duplicate"
    SPAM = "spam", "Spam"
    INCORRECT = "incorrect", "Incorrect"
    ABUSIVE = "abusive", "Abusive"
    OTHER = "other", "Other"


class ReportStatus(models.TextChoices):
    OPEN = "open", "Open"
    REVIEWED = "reviewed", "Reviewed"
    CLOSED = "closed", "Closed"


class ModerationActionType(models.TextChoices):
    SUBMITTED = "submitted", "Submitted"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"
    FLAGGED = "flagged", "Flagged"
    REPORT_CREATED = "report_created", "Report created"


class ListingReport(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="reports")
    reporter = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)
    reason = models.CharField(max_length=32, choices=ListingReportReason.choices, default=ListingReportReason.OTHER)
    details = models.TextField(blank=True)
    status = models.CharField(max_length=16, choices=ReportStatus.choices, default=ReportStatus.OPEN)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"Report<{self.listing_id}:{self.status}>"


class ListingModerationAction(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="moderation_actions")
    report = models.ForeignKey(
        "moderation.ListingReport",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="moderation_actions",
    )
    actor = models.ForeignKey("accounts.User", on_delete=models.SET_NULL, null=True, blank=True)
    action = models.CharField(max_length=32, choices=ModerationActionType.choices)
    notes = models.TextField(blank=True)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ModerationAction<{self.listing_id}:{self.action}>"


class AuditLog(TimeStampedModel):
    actor = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="audit_logs",
    )
    action = models.CharField(max_length=64)
    target_model = models.CharField(max_length=128)
    target_id = models.CharField(max_length=64)
    metadata = models.JSONField(default=dict, blank=True)

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["target_model", "target_id"]),
            models.Index(fields=["action", "created_at"]),
        ]

    def __str__(self) -> str:
        return f"AuditLog<{self.action}:{self.target_model}:{self.target_id}>"
