import os
import uuid

from django.conf import settings
from django.contrib.gis.geos import Polygon
from django.core.files.storage import default_storage
from django.db.models import Count, Q
from rest_framework import generics, status
from rest_framework.parsers import FormParser, MultiPartParser
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import (
    Apartment,
    ApartmentAvailabilityStatus,
    BuildingStatus,
    DeveloperCompany,
    PaymentOptionType,
    ProjectBuilding,
    ResidentialProject,
)
from apps.locations.models import LocationCity, LocationDistrict

from .permissions import IsAdminRoleOrBypass
from .serializers import (
    ApartmentDetailSerializer,
    ApartmentMapPreviewSerializer,
    ApartmentSummarySerializer,
    ApartmentWriteSerializer,
    BuildingDetailSerializer,
    BuildingSummarySerializer,
    BuildingWriteSerializer,
    DeveloperCompanyDetailSerializer,
    DeveloperCompanyListSerializer,
    DeveloperCompanyWriteSerializer,
    ProjectDetailSerializer,
    ProjectSummarySerializer,
    ProjectWriteSerializer,
)


def company_queryset():
    return DeveloperCompany.objects.annotate(
        project_count=Count("projects", distinct=True),
        apartment_count=Count("projects__buildings__apartments", distinct=True),
    ).prefetch_related("projects")


def project_queryset():
    return ResidentialProject.objects.select_related("company", "city", "district").annotate(
        building_count=Count("buildings", distinct=True)
    ).prefetch_related("buildings")


def building_queryset():
    return ProjectBuilding.objects.select_related("project", "project__company").annotate(
        apartments_left=Count(
            "apartments",
            filter=Q(
                apartments__status__in=[
                    ApartmentAvailabilityStatus.AVAILABLE,
                    ApartmentAvailabilityStatus.RESERVED,
                ]
            ),
            distinct=True,
        )
    ).prefetch_related("apartments")


def apartment_queryset(include_private=False):
    queryset = Apartment.objects.select_related(
        "building",
        "building__project",
        "building__project__company",
        "city",
        "district",
    ).prefetch_related("images", "payment_options")
    if include_private:
        return queryset
    return queryset.filter(is_public=True, status__in=[ApartmentAvailabilityStatus.AVAILABLE, ApartmentAvailabilityStatus.RESERVED])


class ReadAfterWriteMixin:
    read_serializer_class = None

    def get_read_serializer_class(self):
        return self.read_serializer_class or self.get_serializer_class()

    def create(self, request, *args, **kwargs):
        response = super().create(request, *args, **kwargs)
        instance = self.get_queryset().get(pk=response.data["id"])
        serializer = self.get_read_serializer_class()(instance, context=self.get_serializer_context())
        response.data = serializer.data
        return response

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop("partial", False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        refreshed = self.get_queryset().get(pk=instance.pk)
        response_serializer = self.get_read_serializer_class()(refreshed, context=self.get_serializer_context())
        return Response(response_serializer.data)


class CompanyListCreateView(ReadAfterWriteMixin, generics.ListCreateAPIView):
    queryset = DeveloperCompany.objects.all()
    read_serializer_class = DeveloperCompanyListSerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = company_queryset()
        if self.request.method == "GET":
            return queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return DeveloperCompanyWriteSerializer
        return DeveloperCompanyListSerializer


class CompanyDetailView(ReadAfterWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"
    read_serializer_class = DeveloperCompanyDetailSerializer

    def get_permissions(self):
        if self.request.method in {"PUT", "PATCH", "DELETE"}:
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = company_queryset()
        if self.request.method == "GET":
            return queryset.filter(is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return DeveloperCompanyWriteSerializer
        return DeveloperCompanyDetailSerializer


class ProjectListCreateView(ReadAfterWriteMixin, generics.ListCreateAPIView):
    queryset = ResidentialProject.objects.all()
    read_serializer_class = ProjectSummarySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = project_queryset()
        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(company_id=company_id)
        if self.request.method == "GET":
            return queryset.filter(is_active=True, company__is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ProjectWriteSerializer
        return ProjectSummarySerializer


class ProjectDetailView(ReadAfterWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"
    read_serializer_class = ProjectDetailSerializer

    def get_permissions(self):
        if self.request.method in {"PUT", "PATCH", "DELETE"}:
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = project_queryset()
        if self.request.method == "GET":
            return queryset.filter(is_active=True, company__is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return ProjectWriteSerializer
        return ProjectDetailSerializer


class BuildingListCreateView(ReadAfterWriteMixin, generics.ListCreateAPIView):
    queryset = ProjectBuilding.objects.all()
    read_serializer_class = BuildingSummarySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = building_queryset()
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(project_id=project_id)
        if self.request.method == "GET":
            return queryset.filter(is_active=True, project__is_active=True, project__company__is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method == "POST":
            return BuildingWriteSerializer
        return BuildingSummarySerializer


class BuildingDetailView(ReadAfterWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"
    read_serializer_class = BuildingDetailSerializer

    def get_permissions(self):
        if self.request.method in {"PUT", "PATCH", "DELETE"}:
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        queryset = building_queryset()
        if self.request.method == "GET":
            return queryset.filter(is_active=True, project__is_active=True, project__company__is_active=True)
        return queryset

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return BuildingWriteSerializer
        return BuildingDetailSerializer


class ApartmentListCreateView(ReadAfterWriteMixin, generics.ListCreateAPIView):
    queryset = Apartment.objects.all()
    read_serializer_class = ApartmentSummarySerializer

    def get_permissions(self):
        if self.request.method == "POST":
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        include_private = self.request.headers.get("X-Admin-Bypass", "").lower() == "true" or (
            self.request.user.is_authenticated and getattr(self.request.user, "is_admin_role", False)
        )
        queryset = apartment_queryset(include_private=include_private)

        building_id = self.request.query_params.get("building")
        if building_id:
            queryset = queryset.filter(building_id=building_id)
        project_id = self.request.query_params.get("project")
        if project_id:
            queryset = queryset.filter(building__project_id=project_id)
        company_id = self.request.query_params.get("company")
        if company_id:
            queryset = queryset.filter(building__project__company_id=company_id)
        city_id = self.request.query_params.get("city")
        if city_id:
            queryset = queryset.filter(city_id=city_id)
        district_id = self.request.query_params.get("district")
        if district_id:
            queryset = queryset.filter(district_id=district_id)

        return queryset.order_by("price", "building__name", "apartment_number")

    def get_serializer_class(self):
        if self.request.method == "POST":
            return ApartmentWriteSerializer
        return ApartmentSummarySerializer


class ApartmentDetailView(ReadAfterWriteMixin, generics.RetrieveUpdateDestroyAPIView):
    lookup_field = "slug"
    read_serializer_class = ApartmentDetailSerializer

    def get_permissions(self):
        if self.request.method in {"PUT", "PATCH", "DELETE"}:
            return [IsAdminRoleOrBypass()]
        return [AllowAny()]

    def get_queryset(self):
        include_private = self.request.headers.get("X-Admin-Bypass", "").lower() == "true" or (
            self.request.user.is_authenticated and getattr(self.request.user, "is_admin_role", False)
        )
        return apartment_queryset(include_private=include_private)

    def get_serializer_class(self):
        if self.request.method in {"PUT", "PATCH"}:
            return ApartmentWriteSerializer
        return ApartmentDetailSerializer


class ApartmentMapListView(generics.ListAPIView):
    serializer_class = ApartmentMapPreviewSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        queryset = apartment_queryset()
        params = self.request.query_params

        project_id = params.get("project")
        if project_id:
            queryset = queryset.filter(building__project_id=project_id)

        company_id = params.get("company")
        if company_id:
            queryset = queryset.filter(building__project__company_id=company_id)

        north = params.get("north")
        south = params.get("south")
        east = params.get("east")
        west = params.get("west")
        if all([north, south, east, west]):
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
            queryset = queryset.filter(location_point__within=polygon)

        return queryset.order_by("price", "id")


class CatalogLookupsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        company_id = request.query_params.get("company")
        project_id = request.query_params.get("project")
        city_id = request.query_params.get("city")

        companies = DeveloperCompany.objects.filter(is_active=True).values("id", "name", "slug")
        projects = ResidentialProject.objects.filter(is_active=True, company__is_active=True).values("id", "name", "slug", "company_id")
        buildings = ProjectBuilding.objects.filter(is_active=True, project__is_active=True).values("id", "name", "slug", "project_id", "code")
        cities = LocationCity.objects.filter(is_active=True).values("id", "name", "slug")
        districts = LocationDistrict.objects.filter(is_active=True).values("id", "name", "slug", "city_id")

        if company_id:
            projects = projects.filter(company_id=company_id)
        if project_id:
            buildings = buildings.filter(project_id=project_id)
        if city_id:
            districts = districts.filter(city_id=city_id)

        return Response(
            {
                "companies": list(companies),
                "projects": list(projects),
                "buildings": list(buildings),
                "cities": list(cities),
                "districts": list(districts),
                "payment_options": [
                    {"value": value, "label": label}
                    for value, label in PaymentOptionType.choices
                ],
                "building_statuses": [
                    {"value": value, "label": label}
                    for value, label in BuildingStatus.choices
                ],
                "apartment_statuses": [
                    {"value": value, "label": label}
                    for value, label in Apartment._meta.get_field("status").choices
                ],
            }
        )


class CatalogImageUploadView(APIView):
    permission_classes = [IsAdminRoleOrBypass]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        upload = request.FILES.get("file")
        if not upload:
            return Response({"detail": "File is required."}, status=status.HTTP_400_BAD_REQUEST)

        extension = os.path.splitext(upload.name)[1] or ".bin"
        storage_key = default_storage.save(f"catalog/{uuid.uuid4().hex}{extension}", upload)
        image_url = request.build_absolute_uri(f"{settings.MEDIA_URL}{storage_key}")
        return Response(
            {
                "image_url": image_url,
                "storage_key": storage_key,
            },
            status=status.HTTP_201_CREATED,
        )
