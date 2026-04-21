from django.contrib.auth import get_user_model
from rest_framework import serializers

from apps.interactions.models import Favorite, RecentlyViewed, SavedSearch, VisitorSession
from apps.listings.api.serializers import ListingListSerializer
from apps.locations.models import LocationCity, LocationDistrict


User = get_user_model()


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


class PresenceHeartbeatSerializer(serializers.Serializer):
    session_key = serializers.CharField(max_length=64)
    current_path = serializers.CharField(max_length=255, required=False, allow_blank=True, default="/")

    def validate_current_path(self, value):
        normalized = (value or "/").strip()
        if not normalized:
            return "/"
        return normalized if normalized.startswith("/") else f"/{normalized}"


class AdminOnlineSessionSerializer(serializers.ModelSerializer):
    first_seen_at = serializers.DateTimeField(source="created_at", read_only=True)
    display_name = serializers.SerializerMethodField()
    email = serializers.SerializerMethodField()
    phone_number = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()
    session_type = serializers.SerializerMethodField()

    class Meta:
        model = VisitorSession
        fields = (
            "session_key",
            "session_type",
            "display_name",
            "email",
            "phone_number",
            "role",
            "locale",
            "current_path",
            "user_agent",
            "first_seen_at",
            "last_seen_at",
        )

    def get_display_name(self, obj):
        if obj.user_id:
            return obj.user.full_name or obj.user.email
        return "Guest visitor"

    def get_email(self, obj):
        return obj.user.email if obj.user_id else ""

    def get_phone_number(self, obj):
        return obj.user.phone_number if obj.user_id else ""

    def get_role(self, obj):
        return obj.user.role if obj.user_id else "guest"

    def get_session_type(self, obj):
        return "guest" if obj.is_guest or not obj.user_id else "registered"


class AdminRegisteredUserSerializer(serializers.ModelSerializer):
    preferred_language = serializers.CharField(source="profile.preferred_language", read_only=True)
    city = serializers.CharField(source="profile.city", read_only=True)
    district = serializers.CharField(source="profile.district", read_only=True)
    last_seen_at = serializers.DateTimeField(read_only=True)
    is_online = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = (
            "id",
            "email",
            "phone_number",
            "first_name",
            "last_name",
            "full_name",
            "role",
            "is_active",
            "created_at",
            "last_login",
            "last_seen_at",
            "is_online",
            "preferred_language",
            "city",
            "district",
        )

    def get_is_online(self, obj):
        return bool(getattr(obj, "online_session_count", 0))
