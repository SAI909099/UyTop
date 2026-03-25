from django.db import models

from apps.common.models import TimeStampedModel
from apps.common.utils import generate_unique_slug


class NearbyPlaceType(models.TextChoices):
    METRO = "metro", "Metro"
    SCHOOL = "school", "School"
    HOSPITAL = "hospital", "Hospital"
    PARK = "park", "Park"
    SHOPPING = "shopping", "Shopping"
    OTHER = "other", "Other"


class LocationCity(TimeStampedModel):
    name = models.CharField(max_length=128, unique=True)
    slug = models.SlugField(max_length=160, unique=True, blank=True)
    country_code = models.CharField(max_length=8, default="UZ")
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, self.name)
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return self.name


class LocationDistrict(TimeStampedModel):
    city = models.ForeignKey("locations.LocationCity", on_delete=models.CASCADE, related_name="districts")
    name = models.CharField(max_length=128)
    slug = models.SlugField(max_length=160, blank=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ["name"]
        constraints = [
            models.UniqueConstraint(fields=["city", "slug"], name="locations_district_city_slug_uniq"),
        ]

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = generate_unique_slug(self, f"{self.city_id or 'city'}-{self.name}")
        super().save(*args, **kwargs)

    def __str__(self) -> str:
        return f"{self.city.name} / {self.name}"


class NearbyPlace(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="nearby_places")
    place_type = models.CharField(max_length=32, choices=NearbyPlaceType.choices, default=NearbyPlaceType.OTHER)
    title = models.CharField(max_length=255)
    distance_meters = models.PositiveIntegerField(default=0)

    class Meta:
        ordering = ["distance_meters", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.place_type})"
