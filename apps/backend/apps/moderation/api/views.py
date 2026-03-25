from django.shortcuts import get_object_or_404
from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.accounts.api.permissions import IsAdminRole
from apps.listings.models import Listing, ListingModerationStatus
from apps.listings.selectors import visible_listings_queryset
from apps.listings.services import approve_listing, reject_listing
from apps.moderation.models import ModerationActionType, ListingReport
from apps.moderation.services import create_audit_log, create_moderation_action

from .serializers import ListingReportCreateSerializer, ListingReportSerializer, ModerationDecisionSerializer


class ListingReportCreateView(generics.CreateAPIView):
    permission_classes = [IsAuthenticated]
    serializer_class = ListingReportCreateSerializer

    def perform_create(self, serializer):
        report = serializer.save()
        create_moderation_action(
            listing=report.listing,
            actor=self.request.user,
            action=ModerationActionType.REPORT_CREATED,
            notes=report.details,
            report=report,
            metadata={"reason": report.reason},
        )
        create_audit_log(
            actor=self.request.user,
            action="listing_report_created",
            target_model="listing_report",
            target_id=report.id,
            metadata={"listing_id": report.listing_id, "reason": report.reason},
        )


class PendingListingListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = ListingReportSerializer

    def get_queryset(self):
        return ListingReport.objects.none()


class AdminPendingListingsView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def list(self, request, *args, **kwargs):
        queryset = Listing.objects.select_related("owner", "city", "district").prefetch_related("images").filter(
            moderation_status=ListingModerationStatus.PENDING_REVIEW
        ).order_by("-updated_at")
        from apps.listings.api.serializers import ListingListSerializer

        page = self.paginate_queryset(queryset)
        serializer = ListingListSerializer(page or queryset, many=True)
        if page is not None:
            return self.get_paginated_response(serializer.data)
        return Response(serializer.data)


class ApproveListingView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, id):
        listing = get_object_or_404(Listing, pk=id)
        serializer = ModerationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        approve_listing(listing=listing)
        create_moderation_action(
            listing=listing,
            actor=request.user,
            action=ModerationActionType.APPROVED,
            notes=serializer.validated_data.get("notes", ""),
        )
        create_audit_log(
            actor=request.user,
            action="listing_approved",
            target_model="listing",
            target_id=listing.id,
            metadata={"notes": serializer.validated_data.get("notes", "")},
        )
        from apps.listings.api.serializers import ListingDetailSerializer

        return Response(ListingDetailSerializer(listing).data)


class RejectListingView(APIView):
    permission_classes = [IsAuthenticated, IsAdminRole]

    def patch(self, request, id):
        listing = get_object_or_404(Listing, pk=id)
        serializer = ModerationDecisionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        reject_listing(listing=listing)
        create_moderation_action(
            listing=listing,
            actor=request.user,
            action=ModerationActionType.REJECTED,
            notes=serializer.validated_data.get("notes", ""),
        )
        create_audit_log(
            actor=request.user,
            action="listing_rejected",
            target_model="listing",
            target_id=listing.id,
            metadata={"notes": serializer.validated_data.get("notes", "")},
        )
        from apps.listings.api.serializers import ListingDetailSerializer

        return Response(ListingDetailSerializer(listing).data)


class AdminReportListView(generics.ListAPIView):
    permission_classes = [IsAuthenticated, IsAdminRole]
    serializer_class = ListingReportSerializer

    def get_queryset(self):
        return ListingReport.objects.select_related("listing__city", "listing__district", "reporter").prefetch_related("listing__images")
