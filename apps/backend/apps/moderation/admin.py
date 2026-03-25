from django.contrib import admin

from .models import AuditLog, ListingModerationAction, ListingReport


@admin.register(ListingReport)
class ListingReportAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "reporter", "status", "created_at")
    list_filter = ("status",)


@admin.register(ListingModerationAction)
class ListingModerationActionAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "action", "actor", "created_at")
    list_filter = ("action",)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ("id", "actor", "action", "target_model", "target_id", "created_at")
    list_filter = ("target_model", "action")
