from django.db.models import F
from drf_spectacular.utils import extend_schema
from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.common.locale import get_request_language
from apps.interactions.services import record_recently_viewed
from apps.listings.models import Listing, ListingModerationStatus, ListingStatus
from apps.listings.selectors import apply_bounds_filter, apply_listing_filters, visible_listings_queryset
from apps.listings.services import mark_listing_rented, mark_listing_sold, submit_listing_for_review
from apps.moderation.models import ModerationActionType
from apps.moderation.services import create_audit_log, create_moderation_action

from .permissions import IsOwnerOrAdmin
from .serializers import ListingDetailSerializer, ListingListSerializer, ListingWriteSerializer, MapListingPreviewSerializer


class ListingListCreateView(generics.ListCreateAPIView):
    queryset = Listing.objects.all()

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsOwnerOrAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = visible_listings_queryset(self.request.user)
        return apply_listing_filters(
            queryset,
            self.request.query_params,
            user=self.request.user,
            language=get_request_language(self.request),
        )

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ListingWriteSerializer
        return ListingListSerializer


class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all()
    lookup_field = "id"

    def get_permissions(self):
        if self.request.method in {"PUT", "DELETE"}:
            return [IsOwnerOrAdmin()]
        return [AllowAny()]

    def get_queryset(self):
        return visible_listings_queryset(self.request.user)

    def get_serializer_class(self):
        if self.request.method == "PUT":
            return ListingWriteSerializer
        return ListingDetailSerializer

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        Listing.objects.filter(pk=instance.pk).update(view_count=F("view_count") + 1)
        instance.refresh_from_db()

        if request.user.is_authenticated:
            record_recently_viewed(user=request.user, listing=instance)

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()
        if not (request.user.is_admin_role or instance.owner_id == request.user.id):
            self.permission_denied(request)

        instance.status = ListingStatus.ARCHIVED
        instance.save(update_fields=["status", "updated_at"])
        return Response(status=status.HTTP_204_NO_CONTENT)


class SubmitForReviewView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    @extend_schema(request=None, responses={200: ListingDetailSerializer})
    def patch(self, request, id):
        listing = visible_listings_queryset(request.user).get(pk=id)
        self.check_object_permissions(request, listing)

        if not listing.images.exists():
            return Response({"detail": "At least one image is required before review."}, status=status.HTTP_400_BAD_REQUEST)

        submit_listing_for_review(listing=listing)
        create_moderation_action(
            listing=listing,
            actor=request.user,
            action=ModerationActionType.SUBMITTED,
            notes="Listing submitted for review.",
        )
        create_audit_log(
            actor=request.user,
            action="listing_submitted_for_review",
            target_model="listing",
            target_id=listing.id,
            metadata={"listing_id": listing.id},
        )
        return Response(ListingDetailSerializer(listing).data)


class MarkSoldView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def patch(self, request, id):
        listing = visible_listings_queryset(request.user).get(pk=id)
        self.check_object_permissions(request, listing)

        if listing.moderation_status != ListingModerationStatus.APPROVED:
            return Response({"detail": "Only approved listings can be marked sold."}, status=status.HTTP_400_BAD_REQUEST)

        mark_listing_sold(listing=listing)
        return Response(ListingDetailSerializer(listing).data)


class MarkRentedView(APIView):
    permission_classes = [IsAuthenticated, IsOwnerOrAdmin]

    def patch(self, request, id):
        listing = visible_listings_queryset(request.user).get(pk=id)
        self.check_object_permissions(request, listing)

        if listing.moderation_status != ListingModerationStatus.APPROVED:
            return Response({"detail": "Only approved listings can be marked rented."}, status=status.HTTP_400_BAD_REQUEST)

        mark_listing_rented(listing=listing)
        return Response(ListingDetailSerializer(listing).data)


class MapListingPreviewView(generics.ListAPIView):
    serializer_class = MapListingPreviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = visible_listings_queryset(self.request.user)
        queryset = apply_listing_filters(
            queryset,
            self.request.query_params,
            user=self.request.user,
            language=get_request_language(self.request),
        )
        return apply_bounds_filter(queryset, self.request.query_params)
