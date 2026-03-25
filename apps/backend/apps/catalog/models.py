from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

from apps.common.models import TimeStampedModel
from apps.common.utils import generate_unique_slug


class BuildingStatus(models.TextChoices):
    PLANNING = "planning", "Planning"
    SALES_OPEN = "sales_open", "Sales open"
    CONSTRUCTION = "construction", "Construction"
    INTERIOR_FINISH = "interior_finish", "Interior finish"
    READY = "ready", "Ready"


class ApartmentAvailabilityStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    AVAILABLE = "available", "Available"
    RESERVED = "reserved", "Reserved"
    SOLD = "sold", "Sold"


class PaymentOptionType(models.TextChoices):
    CASH = "cash", "Cash"
    CREDIT = "credit", "Credit"
    SPLIT_PAYMENT = "split_payment", "Split payment"


class DeveloperCompany(TimeStampedModel):
    name = models.CharField(max_length=255, unique=True)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    tagline = models.CharField(max_length=255, blank=True)
    short_description = models.CharField(max_length=320, blank=True)
    description = models.TextField(blank=True)
    logo_url = models.URLField(max_length=1000, blank=True)
    hero_image_url = models.URLField(max_length=1000, blank=True)
    founded_year = models.PositiveSmallIntegerField(null=True, blank=True)
    headquarters = models.CharField(max_length=255, blank=True)
    trust_note = models.CharField(max_length=320, blank=True)
    is_verified = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class ResidentialProject(TimeStampedModel):
    company = models.ForeignKey("catalog.DeveloperCompany", on_delete=models.CASCADE, related_name="projects")
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    headline = models.CharField(max_length=320, blank=True)
    description = models.TextField(blank=True)
    city = models.ForeignKey("locations.LocationCity", on_delete=models.PROTECT, related_name="catalog_projects")
    district = models.ForeignKey(
        "locations.LocationDistrict",
        on_delete=models.PROTECT,
        related_name="catalog_projects",
        null=True,
        blank=True,
    )
    address = models.CharField(max_length=255, blank=True)
    location_label = models.CharField(max_length=255, blank=True)
    starting_price = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    currency = models.CharField(max_length=8, default="USD")
    delivery_window = models.CharField(max_length=120, blank=True)
    hero_image_url = models.URLField(max_length=1000, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["company__name", "name"]
        constraints = [
            models.UniqueConstraint(fields=["company", "name"], name="catalog_project_company_name_uniq"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, f"{self.company_id or 'company'}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.company.name} / {self.name}"


class ProjectBuilding(TimeStampedModel):
    project = models.ForeignKey("catalog.ResidentialProject", on_delete=models.CASCADE, related_name="buildings")
    code = models.CharField(max_length=32)
    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    status = models.CharField(max_length=32, choices=BuildingStatus.choices, default=BuildingStatus.SALES_OPEN)
    handover = models.CharField(max_length=120, blank=True)
    summary = models.TextField(blank=True)
    total_floors = models.PositiveSmallIntegerField(null=True, blank=True)
    total_apartments = models.PositiveIntegerField(default=0)
    price_from = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    price_to = models.DecimalField(max_digits=14, decimal_places=2, default=0)
    cover_image_url = models.URLField(max_length=1000, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["project__name", "code", "name"]
        constraints = [
            models.UniqueConstraint(fields=["project", "code"], name="catalog_building_project_code_uniq"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, f"{self.project_id or 'project'}-{self.code}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.project.name} / {self.name}"


class Apartment(TimeStampedModel):
    building = models.ForeignKey("catalog.ProjectBuilding", on_delete=models.CASCADE, related_name="apartments")
    title = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    apartment_number = models.CharField(max_length=64)
    description = models.TextField(blank=True)
    status = models.CharField(max_length=32, choices=ApartmentAvailabilityStatus.choices, default=ApartmentAvailabilityStatus.DRAFT)
    is_public = models.BooleanField(default=False)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=8, default="USD")
    rooms = models.PositiveSmallIntegerField()
    size_sqm = models.DecimalField(max_digits=10, decimal_places=2)
    floor = models.PositiveSmallIntegerField()
    address = models.CharField(max_length=255)
    city = models.ForeignKey("locations.LocationCity", on_delete=models.PROTECT, related_name="catalog_apartments")
    district = models.ForeignKey(
        "locations.LocationDistrict",
        on_delete=models.PROTECT,
        related_name="catalog_apartments",
        null=True,
        blank=True,
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_point = models.PointField(geography=True)

    class Meta:
        ordering = ["building__project__name", "building__code", "floor", "apartment_number"]
        constraints = [
            models.UniqueConstraint(fields=["building", "apartment_number"], name="catalog_apartment_building_number_uniq"),
        ]
        indexes = [
            models.Index(fields=["status", "is_public"]),
            models.Index(fields=["city", "district"]),
            models.Index(fields=["price"]),
            models.Index(fields=["slug"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, f"{self.building_id or 'building'}-{self.apartment_number}-{self.title}")
        self.location_point = Point(float(self.longitude), float(self.latitude), srid=4326)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.building.name} / {self.apartment_number}"


class ApartmentImage(TimeStampedModel):
    apartment = models.ForeignKey("catalog.Apartment", on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=1000)
    storage_key = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "created_at"]

    def __str__(self) -> str:
        return f"ApartmentImage<{self.apartment_id}:{self.sort_order}>"


class ApartmentPaymentOption(TimeStampedModel):
    apartment = models.ForeignKey("catalog.Apartment", on_delete=models.CASCADE, related_name="payment_options")
    payment_type = models.CharField(max_length=32, choices=PaymentOptionType.choices)
    notes = models.CharField(max_length=255, blank=True)

    class Meta:
        ordering = ["payment_type"]
        constraints = [
            models.UniqueConstraint(fields=["apartment", "payment_type"], name="catalog_apartment_payment_type_uniq"),
        ]

    def __str__(self) -> str:
        return f"{self.apartment_id}:{self.payment_type}"
