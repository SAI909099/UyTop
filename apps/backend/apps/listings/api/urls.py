from django.urls import path

from .views import ListingDetailView, ListingListCreateView, MapListingPreviewView, MarkRentedView, MarkSoldView, SubmitForReviewView

urlpatterns = [
    path("listings", ListingListCreateView.as_view(), name="listing-list-create"),
    path("listings/<int:id>", ListingDetailView.as_view(), name="listing-detail"),
    path("listings/<int:id>/submit-for-review", SubmitForReviewView.as_view(), name="listing-submit-for-review"),
    path("listings/<int:id>/mark-sold", MarkSoldView.as_view(), name="listing-mark-sold"),
    path("listings/<int:id>/mark-rented", MarkRentedView.as_view(), name="listing-mark-rented"),
    path("map/listings", MapListingPreviewView.as_view(), name="map-listings"),
]
