from django.contrib import admin

from .models import ContactClickLog, Favorite, RecentlyViewed, SavedSearch, SearchAlert


@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "listing", "created_at")
    search_fields = ("user__email", "listing__title")


@admin.register(RecentlyViewed)
class RecentlyViewedAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "listing", "last_viewed_at")
    search_fields = ("user__email", "listing__title")


@admin.register(SavedSearch)
class SavedSearchAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "name", "purpose", "category", "alerts_enabled", "created_at")
    search_fields = ("user__email", "name")


@admin.register(SearchAlert)
class SearchAlertAdmin(admin.ModelAdmin):
    list_display = ("id", "saved_search", "triggered_listing", "is_sent", "created_at")
    list_filter = ("is_sent",)


@admin.register(ContactClickLog)
class ContactClickLogAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "user", "channel", "source", "created_at")
    list_filter = ("channel", "source")
