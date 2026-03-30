from django.contrib.gis.geos import Polygon
from django.db.models import Count, Q

from apps.common.locale import normalize_language
from apps.common.translation import build_localized_text_query
from apps.listings.models import Listing, ListingModerationStatus, ListingStatus


PUBLIC_STATUSES = [ListingStatus.ACTIVE, ListingStatus.SOLD, ListingStatus.RENTED]


def visible_listings_queryset(user):
    queryset = Listing.objects.select_related("owner", "city", "district").prefetch_related("images", "amenities", "nearby_places")

    if user.is_authenticated and getattr(user, "is_admin_role", False):
        return queryset

    if user.is_authenticated:
        return queryset.filter(
            Q(owner=user) | Q(moderation_status=ListingModerationStatus.APPROVED, status__in=PUBLIC_STATUSES)
        ).distinct()

    return queryset.filter(moderation_status=ListingModerationStatus.APPROVED, status__in=PUBLIC_STATUSES)


def apply_listing_filters(queryset, params, user=None, language: str | None = None):
    mapping = {
        "purpose": "purpose",
        "category": "category",
        "city": "city_id",
        "district": "district_id",
    }
    for param, field_name in mapping.items():
        value = params.get(param)
        if value:
            queryset = queryset.filter(**{field_name: value})

    owned_by = params.get("owned_by")
    if owned_by == "me" and user and user.is_authenticated:
        queryset = queryset.filter(owner=user)

    if params.get("featured") == "true":
        queryset = queryset.filter(is_featured=True)
    if params.get("verified") == "true":
        queryset = queryset.filter(is_verified_owner=True)

    furnished = params.get("furnished")
    if furnished in {"true", "false"}:
        queryset = queryset.filter(furnished=furnished == "true")

    numeric_filters = {
        "price_min": ("price__gte",),
        "price_max": ("price__lte",),
        "rooms_min": ("rooms__gte",),
        "rooms_max": ("rooms__lte",),
        "size_min": ("size_sqm__gte",),
        "size_max": ("size_sqm__lte",),
    }
    for param, (lookup,) in numeric_filters.items():
        value = params.get(param)
        if value not in (None, ""):
            queryset = queryset.filter(**{lookup: value})

    search_query = (params.get("search") or params.get("q") or "").strip()
    if search_query:
        resolved_language = normalize_language(language or params.get("locale"))
        queryset = queryset.filter(
            build_localized_text_query("title", resolved_language, search_query)
            | build_localized_text_query("description", resolved_language, search_query)
            | build_localized_text_query("address", resolved_language, search_query)
            | Q(city__name__icontains=search_query)
            | Q(district__name__icontains=search_query)
        )

    sort = params.get("sort", "newest")
    if sort == "price_asc":
        return queryset.order_by("price", "-created_at")
    if sort == "price_desc":
        return queryset.order_by("-price", "-created_at")
    if sort == "relevance":
        return queryset.annotate(favorites_count=Count("favorites")).order_by("-is_featured", "-favorites_count", "-created_at")

    return queryset.order_by("-is_featured", "-published_at", "-created_at")


def apply_bounds_filter(queryset, params):
    north = params.get("north")
    south = params.get("south")
    east = params.get("east")
    west = params.get("west")

    if not all([north, south, east, west]):
        return queryset

    polygon = Polygon(
        (
            (float(west), float(south)),
            (float(west), float(north)),
            (float(east), float(north)),
            (float(east), float(south)),
            (float(west), float(south)),
        ),
        srid=4326,
    )
    return queryset.filter(location_point__within=polygon)
