from django.shortcuts import get_object_or_404
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.interactions.models import Favorite, SavedSearch
from apps.listings.selectors import visible_listings_queryset

from .serializers import FavoriteSerializer, RecentlyViewedSerializer, SavedSearchSerializer


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
