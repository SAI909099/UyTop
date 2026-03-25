from rest_framework import serializers

from apps.catalog.models import (
    Apartment,
    ApartmentImage,
    ApartmentPaymentOption,
    ApartmentAvailabilityStatus,
    DeveloperCompany,
    PaymentOptionType,
    ProjectBuilding,
    ResidentialProject,
)
from apps.catalog.services import sync_apartment_relations
from apps.listings.api.serializers import LocationCitySerializer, LocationDistrictSerializer
from apps.locations.models import LocationCity, LocationDistrict


class ApartmentImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentImage
        fields = ("id", "image_url", "storage_key", "sort_order", "is_primary")


class ApartmentPaymentOptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = ApartmentPaymentOption
        fields = ("payment_type", "notes")


class DeveloperCompanyListSerializer(serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    apartment_count = serializers.SerializerMethodField()

    class Meta:
        model = DeveloperCompany
        fields = (
            "id",
            "name",
            "slug",
            "tagline",
            "short_description",
            "logo_url",
            "hero_image_url",
            "headquarters",
            "trust_note",
            "is_verified",
            "project_count",
            "apartment_count",
        )

    def get_project_count(self, obj):
        return obj.projects.count()

    def get_apartment_count(self, obj):
        return Apartment.objects.filter(building__project__company=obj).count()


class ProjectSummarySerializer(serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    building_count = serializers.SerializerMethodField()

    class Meta:
        model = ResidentialProject
        fields = (
            "id",
            "company",
            "name",
            "slug",
            "headline",
            "location_label",
            "address",
            "city",
            "district",
            "starting_price",
            "currency",
            "delivery_window",
            "hero_image_url",
            "building_count",
        )

    def get_building_count(self, obj):
        return obj.buildings.count()


class BuildingSummarySerializer(serializers.ModelSerializer):
    apartments_left = serializers.SerializerMethodField()

    class Meta:
        model = ProjectBuilding
        fields = (
            "id",
            "project",
            "code",
            "name",
            "slug",
            "status",
            "handover",
            "summary",
            "total_floors",
            "total_apartments",
            "price_from",
            "price_to",
            "cover_image_url",
            "apartments_left",
        )

    def get_apartments_left(self, obj):
        return obj.apartments.filter(
            status__in=[ApartmentAvailabilityStatus.AVAILABLE, ApartmentAvailabilityStatus.RESERVED]
        ).count()


class ApartmentSummarySerializer(serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ApartmentImageSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source="building.project.company.name", read_only=True)
    project_name = serializers.CharField(source="building.project.name", read_only=True)
    building_name = serializers.CharField(source="building.name", read_only=True)
    building_code = serializers.CharField(source="building.code", read_only=True)
    payment_options = ApartmentPaymentOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Apartment
        fields = (
            "id",
            "building",
            "title",
            "slug",
            "apartment_number",
            "description",
            "status",
            "is_public",
            "price",
            "currency",
            "rooms",
            "size_sqm",
            "floor",
            "address",
            "city",
            "district",
            "latitude",
            "longitude",
            "company_name",
            "project_name",
            "building_name",
            "building_code",
            "primary_image",
            "images",
            "payment_options",
        )

    def get_primary_image(self, obj):
        image = next((item for item in obj.images.all() if item.is_primary), None)
        if image:
            return image.image_url
        return obj.images.first().image_url if obj.images.exists() else None


class ApartmentDetailSerializer(ApartmentSummarySerializer):
    class Meta(ApartmentSummarySerializer.Meta):
        fields = ApartmentSummarySerializer.Meta.fields


class DeveloperCompanyDetailSerializer(DeveloperCompanyListSerializer):
    projects = ProjectSummarySerializer(many=True, read_only=True)

    class Meta(DeveloperCompanyListSerializer.Meta):
        fields = DeveloperCompanyListSerializer.Meta.fields + (
            "description",
            "founded_year",
            "is_active",
            "projects",
        )


class ProjectDetailSerializer(ProjectSummarySerializer):
    company = DeveloperCompanyListSerializer(read_only=True)
    buildings = BuildingSummarySerializer(many=True, read_only=True)

    class Meta(ProjectSummarySerializer.Meta):
        fields = ProjectSummarySerializer.Meta.fields + ("description", "is_active", "company", "buildings")


class BuildingDetailSerializer(BuildingSummarySerializer):
    project = ProjectSummarySerializer(read_only=True)
    apartments = ApartmentSummarySerializer(many=True, read_only=True)

    class Meta(BuildingSummarySerializer.Meta):
        fields = BuildingSummarySerializer.Meta.fields + ("is_active", "project", "apartments")


class DeveloperCompanyWriteSerializer(serializers.ModelSerializer):
    class Meta:
        model = DeveloperCompany
        fields = (
            "id",
            "name",
            "tagline",
            "short_description",
            "description",
            "logo_url",
            "hero_image_url",
            "founded_year",
            "headquarters",
            "trust_note",
            "is_verified",
            "is_active",
        )


class ProjectWriteSerializer(serializers.ModelSerializer):
    company_id = serializers.PrimaryKeyRelatedField(queryset=DeveloperCompany.objects.all(), source="company")
    city_id = serializers.PrimaryKeyRelatedField(queryset=LocationCity.objects.all(), source="city")
    district_id = serializers.PrimaryKeyRelatedField(
        queryset=LocationDistrict.objects.all(),
        source="district",
        allow_null=True,
        required=False,
    )

    class Meta:
        model = ResidentialProject
        fields = (
            "id",
            "company_id",
            "name",
            "headline",
            "description",
            "city_id",
            "district_id",
            "address",
            "location_label",
            "starting_price",
            "currency",
            "delivery_window",
            "hero_image_url",
            "is_active",
        )

    def validate(self, attrs):
        city = attrs.get("city", getattr(self.instance, "city", None))
        district = attrs.get("district", getattr(self.instance, "district", None))
        if district and city and district.city_id != city.id:
            raise serializers.ValidationError({"district_id": "District must belong to the selected city."})
        return attrs


class BuildingWriteSerializer(serializers.ModelSerializer):
    project_id = serializers.PrimaryKeyRelatedField(queryset=ResidentialProject.objects.all(), source="project")

    class Meta:
        model = ProjectBuilding
        fields = (
            "id",
            "project_id",
            "code",
            "name",
            "status",
            "handover",
            "summary",
            "total_floors",
            "total_apartments",
            "price_from",
            "price_to",
            "cover_image_url",
            "is_active",
        )

    def validate(self, attrs):
        price_from = attrs.get("price_from", getattr(self.instance, "price_from", 0))
        price_to = attrs.get("price_to", getattr(self.instance, "price_to", 0))
        if price_to and price_from and price_to < price_from:
            raise serializers.ValidationError({"price_to": "Price to cannot be less than price from."})
        return attrs


class ApartmentPaymentOptionInputSerializer(serializers.Serializer):
    payment_type = serializers.ChoiceField(choices=PaymentOptionType.choices)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=255)


class ApartmentUploadedImageInputSerializer(serializers.Serializer):
    image_url = serializers.URLField()
    storage_key = serializers.CharField(required=False, allow_blank=True, max_length=255)


class ApartmentWriteSerializer(serializers.ModelSerializer):
    building_id = serializers.PrimaryKeyRelatedField(queryset=ProjectBuilding.objects.all(), source="building")
    city_id = serializers.PrimaryKeyRelatedField(queryset=LocationCity.objects.all(), source="city")
    district_id = serializers.PrimaryKeyRelatedField(
        queryset=LocationDistrict.objects.all(),
        source="district",
        allow_null=True,
        required=False,
    )
    image_urls = serializers.ListField(child=serializers.URLField(), required=False, default=list, write_only=True)
    uploaded_images = ApartmentUploadedImageInputSerializer(many=True, required=False, default=list, write_only=True)
    payment_options = ApartmentPaymentOptionInputSerializer(many=True, required=False, default=list, write_only=True)

    class Meta:
        model = Apartment
        fields = (
            "id",
            "building_id",
            "title",
            "apartment_number",
            "description",
            "status",
            "is_public",
            "price",
            "currency",
            "rooms",
            "size_sqm",
            "floor",
            "address",
            "city_id",
            "district_id",
            "latitude",
            "longitude",
            "image_urls",
            "uploaded_images",
            "payment_options",
        )

    def validate(self, attrs):
        city = attrs.get("city", getattr(self.instance, "city", None))
        district = attrs.get("district", getattr(self.instance, "district", None))
        building = attrs.get("building", getattr(self.instance, "building", None))
        floor = attrs.get("floor", getattr(self.instance, "floor", None))
        is_public = attrs.get("is_public", getattr(self.instance, "is_public", False))
        image_urls = attrs.get("image_urls", None)
        uploaded_images = attrs.get("uploaded_images", None)
        payment_options = attrs.get("payment_options", None)

        if district and city and district.city_id != city.id:
            raise serializers.ValidationError({"district_id": "District must belong to the selected city."})

        if building and building.total_floors and floor and floor > building.total_floors:
            raise serializers.ValidationError({"floor": "Floor cannot be greater than the building total floors."})

        if is_public:
            current_images = list(getattr(self.instance, "images", []).all()) if self.instance else []
            incoming_count = len(image_urls or []) + len(uploaded_images or [])
            if incoming_count == 0 and not current_images:
                raise serializers.ValidationError({"image_urls": "At least one image is required for public apartments."})

            status_value = attrs.get("status", getattr(self.instance, "status", ApartmentAvailabilityStatus.DRAFT))
            if status_value == ApartmentAvailabilityStatus.DRAFT:
                raise serializers.ValidationError({"status": "Public apartments cannot remain in draft status."})

        payment_options = payment_options if payment_options is not None else (
            list(self.instance.payment_options.values("payment_type", "notes")) if self.instance else []
        )
        option_types = [item["payment_type"] for item in payment_options]
        if len(option_types) != len(set(option_types)):
            raise serializers.ValidationError({"payment_options": "Duplicate payment options are not allowed."})

        return attrs

    def create(self, validated_data):
        image_urls = validated_data.pop("image_urls", [])
        uploaded_images = validated_data.pop("uploaded_images", [])
        payment_options = validated_data.pop("payment_options", [])
        apartment = Apartment.objects.create(**validated_data)
        sync_apartment_relations(
            apartment=apartment,
            image_urls=image_urls,
            uploaded_images=uploaded_images,
            payment_options=payment_options,
        )
        return apartment

    def update(self, instance, validated_data):
        image_urls = validated_data.pop("image_urls", None)
        uploaded_images = validated_data.pop("uploaded_images", None)
        payment_options = validated_data.pop("payment_options", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        instance.save()

        if image_urls is not None or uploaded_images is not None or payment_options is not None:
            sync_apartment_relations(
                apartment=instance,
                image_urls=image_urls if image_urls is not None else [],
                uploaded_images=uploaded_images if uploaded_images is not None else [
                    {"image_url": image.image_url, "storage_key": image.storage_key}
                    for image in instance.images.all()
                ],
                payment_options=payment_options if payment_options is not None else [
                    {"payment_type": option.payment_type, "notes": option.notes}
                    for option in instance.payment_options.all()
                ],
            )
        return instance


class ApartmentMapPreviewSerializer(serializers.ModelSerializer):
    primary_image = serializers.SerializerMethodField()
    payment_options = ApartmentPaymentOptionSerializer(many=True, read_only=True)
    company_name = serializers.CharField(source="building.project.company.name", read_only=True)
    project_name = serializers.CharField(source="building.project.name", read_only=True)
    project_slug = serializers.CharField(source="building.project.slug", read_only=True)
    building_name = serializers.CharField(source="building.name", read_only=True)
    building_slug = serializers.CharField(source="building.slug", read_only=True)

    class Meta:
        model = Apartment
        fields = (
            "id",
            "slug",
            "title",
            "price",
            "currency",
            "latitude",
            "longitude",
            "rooms",
            "size_sqm",
            "status",
            "company_name",
            "project_name",
            "project_slug",
            "building_name",
            "building_slug",
            "primary_image",
            "payment_options",
        )

    def get_primary_image(self, obj):
        image = next((item for item in obj.images.all() if item.is_primary), None)
        if image:
            return image.image_url
        return obj.images.first().image_url if obj.images.exists() else None
