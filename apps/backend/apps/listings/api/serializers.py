from rest_framework import serializers

from apps.common.serializers import LocalizedModelSerializerMixin, TranslatableWriteSerializerMixin
from apps.common.translation import apply_translatable_updates, queue_model_translation
from apps.listings.models import Amenity, Listing, ListingImage
from apps.listings.services import sync_listing_relations
from apps.locations.models import LocationCity, LocationDistrict, NearbyPlace


class LocationCitySerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationCity
        fields = ("id", "name", "slug")


class LocationDistrictSerializer(serializers.ModelSerializer):
    class Meta:
        model = LocationDistrict
        fields = ("id", "name", "slug")


class NearbyPlaceSerializer(serializers.ModelSerializer):
    class Meta:
        model = NearbyPlace
        fields = ("id", "place_type", "title", "distance_meters")


class AmenitySerializer(serializers.ModelSerializer):
    class Meta:
        model = Amenity
        fields = ("id", "title", "slug")


class ListingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ListingImage
        fields = ("id", "image_url", "storage_key", "sort_order", "is_primary")


class ListingListSerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    images = ListingImageSerializer(many=True, read_only=True)
    owner_id = serializers.IntegerField(source="owner.id", read_only=True)
    owner_name = serializers.CharField(source="owner.full_name", read_only=True)

    class Meta:
        model = Listing
        localized_fields = Listing.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "slug",
            "title",
            "purpose",
            "category",
            "price",
            "currency",
            "city",
            "district",
            "latitude",
            "longitude",
            "rooms",
            "size_sqm",
            "is_featured",
            "is_verified_owner",
            "status",
            "moderation_status",
            "owner_id",
            "owner_name",
            "images",
            "created_at",
            "updated_at",
        )


class ListingDetailSerializer(ListingListSerializer):
    amenities = AmenitySerializer(many=True, read_only=True)
    nearby_places = NearbyPlaceSerializer(many=True, read_only=True)

    class Meta(ListingListSerializer.Meta):
        fields = ListingListSerializer.Meta.fields + (
            "description",
            "address",
            "condition",
            "furnished",
            "floor",
            "total_floors",
            "contact_phone",
            "contact_whatsapp",
            "contact_telegram",
            "allow_phone",
            "allow_whatsapp",
            "allow_telegram",
            "view_count",
            "published_at",
            "expires_at",
            "sold_or_rented_at",
            "amenities",
            "nearby_places",
        )


class MapListingPreviewSerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    city = serializers.CharField(source="city.name", read_only=True)
    district = serializers.CharField(source="district.name", read_only=True, default=None)
    primary_image = serializers.SerializerMethodField()

    class Meta:
        model = Listing
        localized_fields = Listing.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "slug",
            "title",
            "purpose",
            "category",
            "price",
            "currency",
            "city",
            "district",
            "latitude",
            "longitude",
            "is_featured",
            "is_verified_owner",
            "primary_image",
        )

    def get_primary_image(self, obj):
        image = next((item for item in obj.images.all() if item.is_primary), None)
        if image:
            return image.image_url
        return obj.images.first().image_url if obj.images.exists() else None


class ListingWriteSerializer(TranslatableWriteSerializerMixin, serializers.ModelSerializer):
    city_id = serializers.PrimaryKeyRelatedField(queryset=LocationCity.objects.all(), source="city")
    district_id = serializers.PrimaryKeyRelatedField(
        queryset=LocationDistrict.objects.all(),
        source="district",
        allow_null=True,
        required=False,
    )
    amenity_ids = serializers.ListField(
        child=serializers.IntegerField(min_value=1),
        required=False,
        default=list,
        write_only=True,
    )
    image_urls = serializers.ListField(
        child=serializers.URLField(),
        required=False,
        default=list,
        write_only=True,
    )

    class Meta:
        model = Listing
        localized_fields = Listing.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "purpose",
            "category",
            "title",
            "description",
            "price",
            "currency",
            "address",
            "city_id",
            "district_id",
            "latitude",
            "longitude",
            "rooms",
            "size_sqm",
            "condition",
            "furnished",
            "floor",
            "total_floors",
            "contact_phone",
            "contact_whatsapp",
            "contact_telegram",
            "allow_phone",
            "allow_whatsapp",
            "allow_telegram",
            "expires_at",
            "amenity_ids",
            "image_urls",
            "source_language",
            "translations",
        )
        read_only_fields = ("id",)

    def validate(self, attrs):
        owner = getattr(self.instance, "owner", self.context["request"].user)
        city = attrs.get("city", getattr(self.instance, "city", None))
        district = attrs.get("district", getattr(self.instance, "district", None))

        if district and city and district.city_id != city.id:
            raise serializers.ValidationError({"district_id": "District must belong to the selected city."})

        floor = attrs.get("floor", getattr(self.instance, "floor", None))
        total_floors = attrs.get("total_floors", getattr(self.instance, "total_floors", None))
        if floor and total_floors and floor > total_floors:
            raise serializers.ValidationError({"floor": "Floor cannot be greater than total floors."})

        allow_phone = attrs.get("allow_phone", getattr(self.instance, "allow_phone", True))
        allow_whatsapp = attrs.get("allow_whatsapp", getattr(self.instance, "allow_whatsapp", False))
        allow_telegram = attrs.get("allow_telegram", getattr(self.instance, "allow_telegram", False))
        if not any([allow_phone, allow_whatsapp, allow_telegram]):
            raise serializers.ValidationError("At least one contact option must be enabled.")

        contact_phone = attrs.get("contact_phone", getattr(self.instance, "contact_phone", "")) or owner.phone_number
        if allow_phone and not contact_phone:
            raise serializers.ValidationError({"contact_phone": "Phone contact is required when phone is enabled."})
        if allow_whatsapp and not (attrs.get("contact_whatsapp", getattr(self.instance, "contact_whatsapp", "")) or contact_phone):
            raise serializers.ValidationError({"contact_whatsapp": "WhatsApp contact is required when WhatsApp is enabled."})
        if allow_telegram and not (attrs.get("contact_telegram", getattr(self.instance, "contact_telegram", ""))):
            raise serializers.ValidationError({"contact_telegram": "Telegram contact is required when Telegram is enabled."})

        return attrs

    def create(self, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        amenity_ids = validated_data.pop("amenity_ids", [])
        image_urls = validated_data.pop("image_urls", [])
        user = self.context["request"].user
        validated_data.setdefault("contact_phone", user.phone_number)
        if validated_data.get("allow_whatsapp"):
            validated_data.setdefault("contact_whatsapp", validated_data.get("contact_phone", user.phone_number))
        listing = Listing(owner=user, **validated_data)
        changed_fields = apply_translatable_updates(
            listing,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        listing.save()
        sync_listing_relations(listing=listing, amenity_ids=amenity_ids, image_urls=image_urls)
        queue_model_translation(listing, changed_fields)
        return listing

    def update(self, instance, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        amenity_ids = validated_data.pop("amenity_ids", None)
        image_urls = validated_data.pop("image_urls", None)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        changed_fields = apply_translatable_updates(
            instance,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        instance.save()

        if amenity_ids is not None or image_urls is not None:
            sync_listing_relations(
                listing=instance,
                amenity_ids=amenity_ids if amenity_ids is not None else list(instance.amenities.values_list("id", flat=True)),
                image_urls=image_urls if image_urls is not None else list(instance.images.values_list("image_url", flat=True)),
            )
        queue_model_translation(instance, changed_fields)
        return instance
