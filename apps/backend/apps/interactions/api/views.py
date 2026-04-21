from django.contrib.auth import get_user_model
from django.db.models import Count, Max, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.permissions import IsAdminRole
from apps.common.locale import get_request_language
from apps.interactions.models import Favorite, SavedSearch, VisitorSession
from apps.interactions.services import ONLINE_WINDOW_MINUTES, get_online_cutoff, record_visitor_session
from apps.listings.selectors import visible_listings_queryset

from .serializers import (
    AdminOnlineSessionSerializer,
    AdminRegisteredUserSerializer,
    FavoriteSerializer,
    PresenceHeartbeatSerializer,
    RecentlyViewedSerializer,
    SavedSearchSerializer,
)


User = get_user_model()


def parse_positive_int(value, *, default: int, maximum: int | None = None):
    try:
        parsed = int(value)
    except (TypeError, ValueError):
        return default

    if parsed < 1:
        return default

    if maximum is not None:
        return min(parsed, maximum)

    return parsed


class FavoriteListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = FavoriteSerializer

    def get_queryset(self):
        return Favorite.objects.select_related("listing__city", "listing__district").prefetch_related("listing__images").filter(user=self.request.user)


class FavoriteToggleView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, listing_id):
        listing = get_object_or_404(visible_listings_queryset(request.user), pk=listing_id)
        favorite, created = Favorite.objects.get_or_create(user=request.user, listing=listing)
        serializer = FavoriteSerializer(favorite)
        return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

    def delete(self, request, listing_id):
        Favorite.objects.filter(user=request.user, listing_id=listing_id).delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class RecentlyViewedListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = RecentlyViewedSerializer

    def get_queryset(self):
        return self.request.user.recently_viewed.select_related("listing__city", "listing__district").prefetch_related("listing__images")


class SavedSearchListCreateView(generics.ListCreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = SavedSearchSerializer

    def get_queryset(self):
        return SavedSearch.objects.filter(user=self.request.user).select_related("city", "district")


class PresenceHeartbeatView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = PresenceHeartbeatSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        visitor_session = record_visitor_session(
            session_key=serializer.validated_data["session_key"],
            current_path=serializer.validated_data.get("current_path", "/"),
            locale=get_request_language(request),
            request=request,
            user=request.user if request.user.is_authenticated else None,
        )

        return Response(
            {
                "session_key": visitor_session.session_key,
                "is_guest": visitor_session.is_guest,
                "last_seen_at": visitor_session.last_seen_at,
            },
            status=status.HTTP_200_OK,
        )


class AdminUserOverviewView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def get(self, request):
        online_cutoff = get_online_cutoff()
        page = parse_positive_int(request.query_params.get("page"), default=1)
        page_size = parse_positive_int(request.query_params.get("page_size"), default=20, maximum=100)
        online_sessions = (
            VisitorSession.objects.select_related("user", "user__profile")
            .filter(last_seen_at__gte=online_cutoff)
            .order_by("-last_seen_at", "-created_at")
        )
        registered_users = (
            User.objects.select_related("profile")
            .annotate(
                last_seen_at=Max("visitor_sessions__last_seen_at"),
                online_session_count=Count("visitor_sessions", filter=Q(visitor_sessions__last_seen_at__gte=online_cutoff)),
            )
            .order_by("-created_at")
        )

        total_registered_users = registered_users.count()
        total_pages = max(1, (total_registered_users + page_size - 1) // page_size)
        page = min(page, total_pages)
        start_index = (page - 1) * page_size
        paginated_users = registered_users[start_index:start_index + page_size]
        registered_payload = {
            "count": total_registered_users,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "next_page": page + 1 if page < total_pages else None,
            "previous_page": page - 1 if page > 1 else None,
            "results": AdminRegisteredUserSerializer(paginated_users, many=True).data,
        }

        metrics = {
            "online_now": online_sessions.count(),
            "registered_accounts": User.objects.count(),
            "guest_sessions": VisitorSession.objects.filter(is_guest=True).count(),
            "total_observed_sessions": VisitorSession.objects.count(),
        }

        return Response(
            {
                "metrics": metrics,
                "online_window_minutes": ONLINE_WINDOW_MINUTES,
                "refreshed_at": timezone.now(),
                "online_sessions": AdminOnlineSessionSerializer(online_sessions, many=True).data,
                "registered_users": registered_payload,
            }
        )
