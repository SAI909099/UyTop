from django.urls import path

from .views import FavoriteListView, FavoriteToggleView, RecentlyViewedListView, SavedSearchListCreateView

urlpatterns = [
    path("favorites", FavoriteListView.as_view(), name="favorites-list"),
    path("favorites/<int:listing_id>", FavoriteToggleView.as_view(), name="favorite-toggle"),
    path("recently-viewed", RecentlyViewedListView.as_view(), name="recently-viewed-list"),
    path("saved-searches", SavedSearchListCreateView.as_view(), name="saved-search-list-create"),
]
