from django.db import models

from apps.common.models import TimeStampedModel


class SearchSortOption(models.TextChoices):
    NEWEST = "newest", "Newest"
    PRICE_ASC = "price_asc", "Price ascending"
    PRICE_DESC = "price_desc", "Price descending"
    RELEVANCE = "relevance", "Relevance"
    DISTANCE = "distance", "Distance"


class ContactChannel(models.TextChoices):
    PHONE = "phone", "Phone"
    WHATSAPP = "whatsapp", "WhatsApp"
    TELEGRAM = "telegram", "Telegram"


class ContactSource(models.TextChoices):
    MOBILE = "mobile", "Mobile"
    ADMIN = "admin", "Admin"
    API = "api", "API"


class Favorite(TimeStampedModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="favorites")
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="favorites")

    class Meta:
        ordering = ["-created_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "listing"], name="interactions_favorite_user_listing_uniq"),
        ]

    def __str__(self) -> str:
        return f"Favorite<{self.user_id}:{self.listing_id}>"


class RecentlyViewed(TimeStampedModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="recently_viewed")
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="recent_views")
    last_viewed_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-last_viewed_at"]
        constraints = [
            models.UniqueConstraint(fields=["user", "listing"], name="interactions_recent_user_listing_uniq"),
        ]

    def __str__(self) -> str:
        return f"RecentlyViewed<{self.user_id}:{self.listing_id}>"


class SavedSearch(TimeStampedModel):
    user = models.ForeignKey("accounts.User", on_delete=models.CASCADE, related_name="saved_searches")
    name = models.CharField(max_length=150)
    purpose = models.CharField(max_length=16, blank=True)
    category = models.CharField(max_length=32, blank=True)
    city = models.ForeignKey(
        "locations.LocationCity",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="saved_searches",
    )
    district = models.ForeignKey(
        "locations.LocationDistrict",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="saved_searches",
    )
    price_min = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    price_max = models.DecimalField(max_digits=14, decimal_places=2, null=True, blank=True)
    rooms_min = models.PositiveSmallIntegerField(null=True, blank=True)
    rooms_max = models.PositiveSmallIntegerField(null=True, blank=True)
    size_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    size_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    furnished = models.BooleanField(null=True, blank=True)
    featured_only = models.BooleanField(default=False)
    verified_owners_only = models.BooleanField(default=False)
    alerts_enabled = models.BooleanField(default=True)
    sort_by = models.CharField(max_length=32, choices=SearchSortOption.choices, default=SearchSortOption.NEWEST)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"SavedSearch<{self.user_id}:{self.name}>"


class SearchAlert(TimeStampedModel):
    saved_search = models.ForeignKey("interactions.SavedSearch", on_delete=models.CASCADE, related_name="alerts")
    triggered_listing = models.ForeignKey(
        "listings.Listing",
        on_delete=models.CASCADE,
        related_name="search_alerts",
    )
    is_sent = models.BooleanField(default=False)
    sent_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"SearchAlert<{self.saved_search_id}:{self.triggered_listing_id}>"


class ContactClickLog(TimeStampedModel):
    listing = models.ForeignKey("listings.Listing", on_delete=models.CASCADE, related_name="contact_clicks")
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="contact_clicks",
    )
    channel = models.CharField(max_length=16, choices=ContactChannel.choices)
    source = models.CharField(max_length=16, choices=ContactSource.choices, default=ContactSource.API)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"ContactClick<{self.listing_id}:{self.channel}>"
