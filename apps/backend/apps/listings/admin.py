from django.contrib import admin

from .models import Amenity, Listing, ListingAmenity, ListingImage


@admin.register(Listing)
class ListingAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "purpose", "status", "moderation_status", "owner", "created_at")
    list_filter = ("purpose", "status", "moderation_status", "category", "city")
    search_fields = ("title", "address")


@admin.register(ListingImage)
class ListingImageAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "sort_order", "is_primary")


@admin.register(Amenity)
class AmenityAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "slug", "is_active")
    search_fields = ("title", "slug")


@admin.register(ListingAmenity)
class ListingAmenityAdmin(admin.ModelAdmin):
    list_display = ("id", "listing", "amenity")
