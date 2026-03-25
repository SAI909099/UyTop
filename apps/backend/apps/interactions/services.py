from django.utils import timezone

from apps.interactions.models import RecentlyViewed


def record_recently_viewed(*, user, listing):
    RecentlyViewed.objects.update_or_create(
        user=user,
        listing=listing,
        defaults={"last_viewed_at": timezone.now()},
    )
