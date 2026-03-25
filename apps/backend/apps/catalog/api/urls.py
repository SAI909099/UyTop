from django.urls import path

from .views import (
    ApartmentDetailView,
    ApartmentListCreateView,
    ApartmentMapListView,
    BuildingDetailView,
    BuildingListCreateView,
    CatalogImageUploadView,
    CatalogLookupsView,
    CompanyDetailView,
    CompanyListCreateView,
    ProjectDetailView,
    ProjectListCreateView,
)


urlpatterns = [
    path("catalog/companies", CompanyListCreateView.as_view(), name="catalog-company-list-create"),
    path("catalog/companies/<slug:slug>", CompanyDetailView.as_view(), name="catalog-company-detail"),
    path("catalog/projects", ProjectListCreateView.as_view(), name="catalog-project-list-create"),
    path("catalog/projects/<slug:slug>", ProjectDetailView.as_view(), name="catalog-project-detail"),
    path("catalog/buildings", BuildingListCreateView.as_view(), name="catalog-building-list-create"),
    path("catalog/buildings/<slug:slug>", BuildingDetailView.as_view(), name="catalog-building-detail"),
    path("catalog/apartments", ApartmentListCreateView.as_view(), name="catalog-apartment-list-create"),
    path("catalog/apartments/<slug:slug>", ApartmentDetailView.as_view(), name="catalog-apartment-detail"),
    path("catalog/map/apartments", ApartmentMapListView.as_view(), name="catalog-apartment-map-list"),
    path("catalog/lookups", CatalogLookupsView.as_view(), name="catalog-lookups"),
    path("catalog/uploads/images", CatalogImageUploadView.as_view(), name="catalog-image-upload"),
]
