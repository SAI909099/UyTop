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
from apps.common.locale import get_request_language
from apps.common.serializers import LocalizedModelSerializerMixin, TranslatableWriteSerializerMixin
from apps.common.translation import apply_translatable_updates, get_localized_value, queue_model_translation
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


class DeveloperCompanyListSerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    project_count = serializers.SerializerMethodField()
    apartment_count = serializers.SerializerMethodField()

    class Meta:
        model = DeveloperCompany
        localized_fields = DeveloperCompany.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "name",
            "slug",
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
            "project_count",
            "apartment_count",
        )

    def get_project_count(self, obj):
        return obj.projects.count()

    def get_apartment_count(self, obj):
        return Apartment.objects.filter(building__project__company=obj).count()


class ProjectSummarySerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    building_count = serializers.SerializerMethodField()

    class Meta:
        model = ResidentialProject
        localized_fields = ResidentialProject.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "company",
            "name",
            "slug",
            "headline",
            "description",
            "location_label",
            "address",
            "city",
            "district",
            "starting_price",
            "currency",
            "delivery_window",
            "hero_image_url",
            "is_active",
            "building_count",
        )

    def get_building_count(self, obj):
        return obj.buildings.count()


class BuildingSummarySerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    apartments_left = serializers.SerializerMethodField()

    class Meta:
        model = ProjectBuilding
        localized_fields = ProjectBuilding.TRANSLATABLE_FIELDS
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
            "is_active",
            "apartments_left",
        )

    def get_apartments_left(self, obj):
        return obj.apartments.filter(
            status__in=[ApartmentAvailabilityStatus.AVAILABLE, ApartmentAvailabilityStatus.RESERVED]
        ).count()


class ApartmentSummarySerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    images = ApartmentImageSerializer(many=True, read_only=True)
    company_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    building_name = serializers.SerializerMethodField()
    building_code = serializers.CharField(source="building.code", read_only=True)
    payment_options = ApartmentPaymentOptionSerializer(many=True, read_only=True)

    class Meta:
        model = Apartment
        localized_fields = Apartment.TRANSLATABLE_FIELDS
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

    def get_company_name(self, obj):
        return get_localized_value(obj.building.project.company, "name", get_request_language(self.context.get("request")))

    def get_project_name(self, obj):
        return get_localized_value(obj.building.project, "name", get_request_language(self.context.get("request")))

    def get_building_name(self, obj):
        return get_localized_value(obj.building, "name", get_request_language(self.context.get("request")))


class ApartmentDetailSerializer(ApartmentSummarySerializer):
    class Meta(ApartmentSummarySerializer.Meta):
        fields = ApartmentSummarySerializer.Meta.fields


class DeveloperCompanyDetailSerializer(DeveloperCompanyListSerializer):
    projects = ProjectSummarySerializer(many=True, read_only=True)

    class Meta(DeveloperCompanyListSerializer.Meta):
        fields = DeveloperCompanyListSerializer.Meta.fields + ("projects",)


class ProjectDetailSerializer(ProjectSummarySerializer):
    company = DeveloperCompanyListSerializer(read_only=True)
    buildings = BuildingSummarySerializer(many=True, read_only=True)

    class Meta(ProjectSummarySerializer.Meta):
        fields = ProjectSummarySerializer.Meta.fields + ("company", "buildings")


class BuildingDetailSerializer(BuildingSummarySerializer):
    project = ProjectSummarySerializer(read_only=True)
    apartments = ApartmentSummarySerializer(many=True, read_only=True)

    class Meta(BuildingSummarySerializer.Meta):
        fields = BuildingSummarySerializer.Meta.fields + ("project", "apartments")


class DeveloperCompanyWriteSerializer(TranslatableWriteSerializerMixin, serializers.ModelSerializer):
    class Meta:
        model = DeveloperCompany
        localized_fields = DeveloperCompany.TRANSLATABLE_FIELDS
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
            "source_language",
            "translations",
        )

    def create(self, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        company = DeveloperCompany(**validated_data)
        changed_fields = apply_translatable_updates(
            company,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        company.save()
        queue_model_translation(company, changed_fields)
        return company

    def update(self, instance, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        changed_fields = apply_translatable_updates(
            instance,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        instance.save()
        queue_model_translation(instance, changed_fields)
        return instance


class ProjectWriteSerializer(TranslatableWriteSerializerMixin, serializers.ModelSerializer):
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
        localized_fields = ResidentialProject.TRANSLATABLE_FIELDS
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
            "source_language",
            "translations",
        )

    def validate(self, attrs):
        city = attrs.get("city", getattr(self.instance, "city", None))
        district = attrs.get("district", getattr(self.instance, "district", None))
        if district and city and district.city_id != city.id:
            raise serializers.ValidationError({"district_id": "District must belong to the selected city."})
        return attrs

    def create(self, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        project = ResidentialProject(**validated_data)
        changed_fields = apply_translatable_updates(
            project,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        project.save()
        queue_model_translation(project, changed_fields)
        return project

    def update(self, instance, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        changed_fields = apply_translatable_updates(
            instance,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        instance.save()
        queue_model_translation(instance, changed_fields)
        return instance


class BuildingWriteSerializer(TranslatableWriteSerializerMixin, serializers.ModelSerializer):
    project_id = serializers.PrimaryKeyRelatedField(queryset=ResidentialProject.objects.all(), source="project")

    class Meta:
        model = ProjectBuilding
        localized_fields = ProjectBuilding.TRANSLATABLE_FIELDS
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
            "source_language",
            "translations",
        )

    def validate(self, attrs):
        price_from = attrs.get("price_from", getattr(self.instance, "price_from", 0))
        price_to = attrs.get("price_to", getattr(self.instance, "price_to", 0))
        if price_to and price_from and price_to < price_from:
            raise serializers.ValidationError({"price_to": "Price to cannot be less than price from."})
        return attrs

    def create(self, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        building = ProjectBuilding(**validated_data)
        changed_fields = apply_translatable_updates(
            building,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        building.save()
        queue_model_translation(building, changed_fields)
        return building

    def update(self, instance, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        for field, value in validated_data.items():
            setattr(instance, field, value)
        changed_fields = apply_translatable_updates(
            instance,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        instance.save()
        queue_model_translation(instance, changed_fields)
        return instance


class ApartmentPaymentOptionInputSerializer(serializers.Serializer):
    payment_type = serializers.ChoiceField(choices=PaymentOptionType.choices)
    notes = serializers.CharField(required=False, allow_blank=True, max_length=255)


class ApartmentUploadedImageInputSerializer(serializers.Serializer):
    image_url = serializers.URLField()
    storage_key = serializers.CharField(required=False, allow_blank=True, max_length=255)


class ApartmentWriteSerializer(TranslatableWriteSerializerMixin, serializers.ModelSerializer):
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
        localized_fields = Apartment.TRANSLATABLE_FIELDS
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
            "source_language",
            "translations",
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
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        image_urls = validated_data.pop("image_urls", [])
        uploaded_images = validated_data.pop("uploaded_images", [])
        payment_options = validated_data.pop("payment_options", [])
        apartment = Apartment(**validated_data)
        changed_fields = apply_translatable_updates(
            apartment,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
        apartment.save()
        sync_apartment_relations(
            apartment=apartment,
            image_urls=image_urls,
            uploaded_images=uploaded_images,
            payment_options=payment_options,
        )
        queue_model_translation(apartment, changed_fields)
        return apartment

    def update(self, instance, validated_data):
        source_language, translations, source_values = self.pop_translation_controls(validated_data)
        image_urls = validated_data.pop("image_urls", None)
        uploaded_images = validated_data.pop("uploaded_images", None)
        payment_options = validated_data.pop("payment_options", None)

        for field, value in validated_data.items():
            setattr(instance, field, value)
        changed_fields = apply_translatable_updates(
            instance,
            source_language=source_language,
            source_values=source_values,
            translations_payload=translations,
        )
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
        queue_model_translation(instance, changed_fields)
        return instance


class ApartmentMapPreviewSerializer(LocalizedModelSerializerMixin, serializers.ModelSerializer):
    city = LocationCitySerializer(read_only=True)
    district = LocationDistrictSerializer(read_only=True)
    primary_image = serializers.SerializerMethodField()
    payment_options = ApartmentPaymentOptionSerializer(many=True, read_only=True)
    company_name = serializers.SerializerMethodField()
    project_name = serializers.SerializerMethodField()
    project_slug = serializers.CharField(source="building.project.slug", read_only=True)
    building_name = serializers.SerializerMethodField()
    building_slug = serializers.CharField(source="building.slug", read_only=True)

    class Meta:
        model = Apartment
        localized_fields = Apartment.TRANSLATABLE_FIELDS
        fields = (
            "id",
            "slug",
            "title",
            "price",
            "currency",
            "latitude",
            "longitude",
            "city",
            "district",
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

    def get_company_name(self, obj):
        return get_localized_value(obj.building.project.company, "name", get_request_language(self.context.get("request")))

    def get_project_name(self, obj):
        return get_localized_value(obj.building.project, "name", get_request_language(self.context.get("request")))

    def get_building_name(self, obj):
        return get_localized_value(obj.building, "name", get_request_language(self.context.get("request")))
