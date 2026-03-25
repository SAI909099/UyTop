from django.contrib import admin

from .models import OwnerVerification, User, UserProfile


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ("id", "email", "phone_number", "role", "is_active", "is_staff", "created_at")
    search_fields = ("email", "phone_number")
    list_filter = ("role", "is_active", "is_staff")


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "preferred_language", "created_at")


@admin.register(OwnerVerification)
class OwnerVerificationAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "reviewed_by", "reviewed_at")
    list_filter = ("status",)
