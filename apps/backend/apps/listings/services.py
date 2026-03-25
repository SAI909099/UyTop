from django.db import transaction
from django.utils import timezone

from apps.listings.models import Listing, ListingAmenity, ListingImage, ListingModerationStatus, ListingStatus


@transaction.atomic
def sync_listing_relations(*, listing: Listing, amenity_ids: list[int], image_urls: list[str]):
    ListingAmenity.objects.filter(listing=listing).exclude(amenity_id__in=amenity_ids).delete()
    existing_amenity_ids = set(
        ListingAmenity.objects.filter(listing=listing).values_list("amenity_id", flat=True)
    )
    for amenity_id in amenity_ids:
        if amenity_id not in existing_amenity_ids:
            ListingAmenity.objects.create(listing=listing, amenity_id=amenity_id)

    ListingImage.objects.filter(listing=listing).delete()
    for index, image_url in enumerate(image_urls):
        ListingImage.objects.create(
            listing=listing,
            image_url=image_url,
            sort_order=index,
            is_primary=index == 0,
        )


def submit_listing_for_review(*, listing: Listing):
    listing.moderation_status = ListingModerationStatus.PENDING_REVIEW
    listing.save(update_fields=["moderation_status", "updated_at"])
    return listing


def approve_listing(*, listing: Listing):
    now = timezone.now()
    listing.moderation_status = ListingModerationStatus.APPROVED
    listing.status = ListingStatus.ACTIVE
    listing.published_at = listing.published_at or now
    listing.save(update_fields=["moderation_status", "status", "published_at", "updated_at"])
    return listing


def reject_listing(*, listing: Listing):
    listing.moderation_status = ListingModerationStatus.REJECTED
    listing.status = ListingStatus.DRAFT
    listing.save(update_fields=["moderation_status", "status", "updated_at"])
    return listing


def mark_listing_sold(*, listing: Listing):
    listing.status = ListingStatus.SOLD
    listing.sold_or_rented_at = timezone.now()
    listing.save(update_fields=["status", "sold_or_rented_at", "updated_at"])
    return listing


def mark_listing_rented(*, listing: Listing):
    listing.status = ListingStatus.RENTED
    listing.sold_or_rented_at = timezone.now()
    listing.save(update_fields=["status", "sold_or_rented_at", "updated_at"])
    return listing
