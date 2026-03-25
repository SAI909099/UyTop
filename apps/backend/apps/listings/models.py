from django.contrib.gis.db import models
from django.contrib.gis.geos import Point

from apps.common.models import TimeStampedModel
from apps.common.utils import generate_unique_slug


class ListingPurpose(models.TextChoices):
    SALE = "sale", "Sale"
    RENT = "rent", "Rent"


class ListingCategory(models.TextChoices):
    HOUSE = "house", "House"
    APARTMENT = "apartment", "Apartment"
    LAND = "land", "Land"
    COMMERCIAL = "commercial", "Commercial"


class ListingStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    ACTIVE = "active", "Active"
    ARCHIVED = "archived", "Archived"
    SOLD = "sold", "Sold"
    RENTED = "rented", "Rented"


class ListingModerationStatus(models.TextChoices):
    DRAFT = "draft", "Draft"
    PENDING_REVIEW = "pending_review", "Pending review"
    APPROVED = "approved", "Approved"
    REJECTED = "rejected", "Rejected"


class ListingCondition(models.TextChoices):
    NEW = "new", "New"
    GOOD = "good", "Good"
    NEEDS_RENOVATION = "needs_renovation", "Needs renovation"


class Amenity(TimeStampedModel):
    title = models.CharField(max_length=128, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["title"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class Listing(TimeStampedModel):
    owner = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="listings")
    purpose = models.CharField(max_length=16, choices=ListingPurpose.choices)
    category = models.CharField(max_length=32, choices=ListingCategory.choices)
    slug = models.SlugField(max_length=255, unique=True, blank=True)
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=14, decimal_places=2)
    currency = models.CharField(max_length=8, default="UZS")
    address = models.CharField(max_length=255)
    city = models.ForeignKey("locations.LocationCity", on_delete=models.PROTECT, related_name="listings")
    district = models.ForeignKey(
        "locations.LocationDistrict",
        on_delete=models.PROTECT,
        related_name="listings",
        null=True,
        blank=True,
    )
    latitude = models.DecimalField(max_digits=9, decimal_places=6)
    longitude = models.DecimalField(max_digits=9, decimal_places=6)
    location_point = models.PointField(geography=True)
    rooms = models.PositiveSmallIntegerField(null=True, blank=True)
    size_sqm = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    condition = models.CharField(max_length=32, choices=ListingCondition.choices, default=ListingCondition.GOOD)
    furnished = models.BooleanField(default=False)
    floor = models.PositiveSmallIntegerField(null=True, blank=True)
    total_floors = models.PositiveSmallIntegerField(null=True, blank=True)
    contact_phone = models.CharField(max_length=32, blank=True)
    contact_whatsapp = models.CharField(max_length=32, blank=True)
    contact_telegram = models.CharField(max_length=64, blank=True)
    allow_phone = models.BooleanField(default=True)
    allow_whatsapp = models.BooleanField(default=False)
    allow_telegram = models.BooleanField(default=False)
    status = models.CharField(max_length=32, choices=ListingStatus.choices, default=ListingStatus.DRAFT)
    moderation_status = models.CharField(
        max_length=32,
        choices=ListingModerationStatus.choices,
        default=ListingModerationStatus.DRAFT,
    )
    is_featured = models.BooleanField(default=False)
    is_verified_owner = models.BooleanField(default=False)
    view_count = models.PositiveIntegerField(default=0)
    published_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
    sold_or_rented_at = models.DateTimeField(null=True, blank=True)
    amenities = models.ManyToManyField("listings.Amenity", through="listings.ListingAmenity", related_name="listings")

    class Meta:
        ordering = ["-created_at"]
        indexes = [
            models.Index(fields=["status", "moderation_status", "purpose", "category"]),
            models.Index(fields=["city", "district"]),
            models.Index(fields=["price", "created_at"]),
            models.Index(fields=["published_at"]),
            models.Index(fields=["is_featured"]),
            models.Index(fields=["slug"]),
            models.Index(fields=["view_count"]),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.title)
        self.is_verified_owner = self.owner.is_verified_owner
        self.location_point = Point(float(self.longitude), float(self.latitude), srid=4326)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.title


class ListingImage(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="images")
    image_url = models.URLField(max_length=1000)
    storage_key = models.CharField(max_length=255, blank=True)
    sort_order = models.PositiveSmallIntegerField(default=0)
    is_primary = models.BooleanField(default=False)

    class Meta:
        ordering = ["sort_order", "created_at"]

    def __str__(self) -> str:
        return f"ListingImage<{self.listing_id}:{self.sort_order}>"


class ListingAmenity(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE)
    amenity = models.ForeignKey("listings.Amenity", on_delete=models.CASCADE)

    class Meta:
        ordering = ["id"]
        constraints = [
            models.UniqueConstraint(fields=["listing", "amenity"], name="listings_listing_amenity_uniq"),
        ]

    def __str__(self) -> str:
        return f"ListingAmenity<{self.listing_id}:{self.amenity_id}>"
