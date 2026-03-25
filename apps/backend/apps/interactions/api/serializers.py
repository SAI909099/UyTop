from rest_framework import serializers

from apps.interactions.models import Favorite, RecentlyViewed, SavedSearch
from apps.listings.api.serializers import ListingListSerializer
from apps.locations.models import LocationCity, LocationDistrict


class FavoriteSerializer(serializers.ModelSerializer):
    listing = ListingListSerializer(read_only=True)

    class Meta:
        model = Favorite
        fields = ("id", "listing", "created_at")


class RecentlyViewedSerializer(serializers.ModelSerializer):
    listing = ListingListSerializer(read_only=True)

    class Meta:
        model = RecentlyViewed
        fields = ("id", "listing", "last_viewed_at")


class SavedSearchSerializer(serializers.ModelSerializer):
    city_id = serializers.PrimaryKeyRelatedField(queryset=LocationCity.objects.all(), source="city", allow_null=True, required=False)
    district_id = serializers.PrimaryKeyRelatedField(queryset=LocationDistrict.objects.all(), source="district", allow_null=True, required=False)

    class Meta:
        model = SavedSearch
        fields = (
            "id",
            "name",
            "purpose",
            "category",
            "city_id",
            "district_id",
            "price_min",
            "price_max",
            "rooms_min",
            "rooms_max",
            "size_min",
            "size_max",
            "furnished",
            "featured_only",
            "verified_owners_only",
            "alerts_enabled",
            "sort_by",
            "created_at",
        )
        read_only_fields = ("id", "created_at")

    def validate(self, attrs):
        city = attrs.get("city")
        district = attrs.get("district")
        if city and district and district.city_id != city.id:
            raise serializers.ValidationError({"district_id": "District must belong to the selected city."})
        return attrs

    def create(self, validated_data):
        return SavedSearch.objects.create(user=self.context["request"].user, **validated_data)
