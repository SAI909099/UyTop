from django.contrib import admin

from .models import LocationCity, LocationDistrict, NearbyPlace


@admin.register(LocationCity)
class LocationCityAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "country_code", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("country_code", "is_active")


@admin.register(LocationDistrict)
class LocationDistrictAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "city", "is_active")
    search_fields = ("name", "slug")
    list_filter = ("city", "is_active")


@admin.register(NearbyPlace)
class NearbyPlaceAdmin(admin.ModelAdmin):
    list_display = ("id", "title", "place_type", "distance_meters", "listing")
    list_filter = ("place_type",)
