import tempfile
from datetime import timedelta
from decimal import Decimal

from django.core.files.uploadedfile import SimpleUploadedFile
from django.utils import timezone
from django.test import override_settings
from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.catalog.models import Apartment, ApartmentAvailabilityStatus, DeveloperCompany, PaymentOptionType, ProjectBuilding, ResidentialProject
from apps.locations.models import LocationCity, LocationDistrict


User = get_user_model()


class CatalogApiTests(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.city = LocationCity.objects.create(name="Tashkent", country_code="UZ")
        self.district = LocationDistrict.objects.create(city=self.city, name="Yunusabad")
        self.admin = User.objects.create_user(
            email="admin-catalog@example.com",
            phone_number="+998900100001",
            password="StrongPass123",
            role="admin",
            is_staff=True,
            first_name="Catalog",
            last_name="Admin",
        )

    def authenticate(self):
        self.client.force_authenticate(user=self.admin)

    def create_company(self):
        return DeveloperCompany.objects.create(
            name="Dream House",
            tagline="Premium residential developer",
            short_description="Flagship developer profile",
            description="Company description",
            logo_url="https://example.com/logo.png",
            hero_image_url="https://example.com/hero.png",
            is_verified=True,
        )

    def create_project(self, company, **overrides):
        project_data = {
            "company": company,
            "name": "Riverside Signature",
            "headline": "Premium river-facing project",
            "description": "Project description",
            "city": self.city,
            "district": self.district,
            "address": "Sample address",
            "location_label": "Riverfront",
            "starting_price": Decimal("150000.00"),
            "currency": "USD",
            "delivery_window": "Q4 2026",
            "hero_image_url": "https://example.com/project.png",
        }
        project_data.update(overrides)
        return ResidentialProject.objects.create(**project_data)

    def create_building(self, project, **overrides):
        building_data = {
            "project": project,
            "code": "A",
            "name": "Building A",
            "status": "sales_open",
            "handover": "Q4 2026",
            "total_floors": 16,
            "total_apartments": 80,
            "price_from": Decimal("150000.00"),
            "price_to": Decimal("300000.00"),
            "cover_image_url": "https://example.com/building.png",
        }
        building_data.update(overrides)
        return ProjectBuilding.objects.create(**building_data)

    def create_apartment(self, building, **overrides):
        apartment_data = {
            "building": building,
            "title": "Two Bedroom Corner",
            "apartment_number": "A-12-01",
            "description": "Apartment description",
            "status": ApartmentAvailabilityStatus.AVAILABLE,
            "is_public": True,
            "price": Decimal("228000.00"),
            "currency": "USD",
            "rooms": 2,
            "size_sqm": Decimal("86.00"),
            "floor": 12,
            "address": "Sample address",
            "city": self.city,
            "district": self.district,
            "latitude": Decimal("41.311081"),
            "longitude": Decimal("69.240562"),
        }
        apartment_data.update(overrides)
        apartment = Apartment.objects.create(**apartment_data)
        apartment.images.create(
            image_url="https://example.com/apartment-1.png",
            is_primary=True,
            sort_order=0,
        )
        apartment.payment_options.create(payment_type=PaymentOptionType.CASH)
        return apartment

    def test_admin_can_create_catalog_hierarchy_and_apartment(self):
        self.authenticate()

        company_response = self.client.post(
            "/api/catalog/companies",
            {
                "name": "Dream House",
                "tagline": "Premium residential developer",
                "short_description": "Flagship developer profile",
                "description": "Company description",
                "logo_url": "https://example.com/logo.png",
                "hero_image_url": "https://example.com/hero.png",
                "founded_year": 2014,
                "headquarters": "Tashkent",
                "trust_note": "Verified",
                "is_verified": True,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(company_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("slug", company_response.data)
        self.assertEqual(company_response.data["name"], "Dream House")

        project_response = self.client.post(
            "/api/catalog/projects",
            {
                "company_id": company_response.data["id"],
                "name": "Riverside Signature",
                "headline": "Premium river-facing project",
                "description": "Project description",
                "city_id": self.city.id,
                "district_id": self.district.id,
                "address": "Sample address",
                "location_label": "Riverfront",
                "starting_price": "150000.00",
                "currency": "USD",
                "delivery_window": "Q4 2026",
                "hero_image_url": "https://example.com/project.png",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(project_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("slug", project_response.data)
        self.assertIn("city", project_response.data)

        building_response = self.client.post(
            "/api/catalog/buildings",
            {
                "project_id": project_response.data["id"],
                "code": "A",
                "name": "Building A",
                "status": "sales_open",
                "handover": "Q4 2026",
                "summary": "Building summary",
                "total_floors": 16,
                "total_apartments": 80,
                "price_from": "150000.00",
                "price_to": "300000.00",
                "cover_image_url": "https://example.com/building.png",
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(building_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("slug", building_response.data)
        self.assertIn("apartments_left", building_response.data)

        apartment_response = self.client.post(
            "/api/catalog/apartments",
            {
                "building_id": building_response.data["id"],
                "title": "Two Bedroom Corner",
                "apartment_number": "A-12-01",
                "description": "Apartment description",
                "status": "available",
                "is_public": True,
                "price": "228000.00",
                "currency": "USD",
                "rooms": 2,
                "size_sqm": "86.00",
                "floor": 12,
                "address": "Sample address",
                "city_id": self.city.id,
                "district_id": self.district.id,
                "latitude": "41.311081",
                "longitude": "69.240562",
                "image_urls": ["https://example.com/apartment-1.png"],
                "payment_options": [
                    {"payment_type": "cash", "notes": "Full payment discount"},
                    {"payment_type": "credit", "notes": "Bank mortgage accepted"},
                ],
            },
            format="json",
        )
        self.assertEqual(apartment_response.status_code, status.HTTP_201_CREATED)
        self.assertIn("slug", apartment_response.data)
        self.assertEqual(apartment_response.data["company_name"], "Dream House")
        self.assertTrue(
            Apartment.objects.filter(apartment_number="A-12-01", building__name="Building A").exists()
        )

    def test_public_map_returns_only_public_available_or_reserved_apartments(self):
        company = self.create_company()
        project = self.create_project(company)
        building = self.create_building(project)
        self.create_apartment(building)
        Apartment.objects.create(
            building=building,
            title="Hidden Draft",
            apartment_number="A-03-01",
            status=ApartmentAvailabilityStatus.DRAFT,
            is_public=False,
            price=Decimal("145000.00"),
            currency="USD",
            rooms=1,
            size_sqm=Decimal("48.00"),
            floor=3,
            address="Hidden",
            city=self.city,
            district=self.district,
            latitude=Decimal("41.300000"),
            longitude=Decimal("69.230000"),
        )

        response = self.client.get(
            "/api/catalog/map/apartments",
            {
                "north": "41.5",
                "south": "41.0",
                "east": "69.5",
                "west": "69.0",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["company_name"], "Dream House")
        self.assertEqual(response.data["results"][0]["city"]["name"], "Tashkent")
        self.assertEqual(response.data["results"][0]["district"]["name"], "Yunusabad")
        self.assertEqual(response.data["results"][0]["payment_options"][0]["payment_type"], PaymentOptionType.CASH)

    def test_public_map_returns_empty_payment_options_when_none_exist(self):
        company = self.create_company()
        project = self.create_project(company)
        building = self.create_building(project)
        apartment = Apartment.objects.create(
            building=building,
            title="No Financing Labels",
            apartment_number="A-06-02",
            status=ApartmentAvailabilityStatus.AVAILABLE,
            is_public=True,
            price=Decimal("189000.00"),
            currency="USD",
            rooms=2,
            size_sqm=Decimal("73.00"),
            floor=6,
            address="Map-only apartment",
            city=self.city,
            district=self.district,
            latitude=Decimal("41.315000"),
            longitude=Decimal("69.245000"),
        )
        apartment.images.create(image_url="https://example.com/apartment-no-payment.png", is_primary=True, sort_order=0)

        response = self.client.get("/api/catalog/map/apartments")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        result = next(item for item in response.data["results"] if item["id"] == apartment.id)
        self.assertEqual(result["payment_options"], [])

    def test_apartment_validation_rejects_invalid_floor_and_public_without_image(self):
        self.authenticate()
        company = self.create_company()
        project = self.create_project(company)
        building = self.create_building(project)

        response = self.client.post(
            "/api/catalog/apartments",
            {
                "building_id": building.id,
                "title": "Broken Apartment",
                "apartment_number": "A-99-01",
                "status": "available",
                "is_public": True,
                "price": "100000.00",
                "currency": "USD",
                "rooms": 2,
                "size_sqm": "70.00",
                "floor": 20,
                "address": "Sample address",
                "city_id": self.city.id,
                "district_id": self.district.id,
                "latitude": "41.311081",
                "longitude": "69.240562",
                "payment_options": [{"payment_type": "cash", "notes": ""}],
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("floor", response.data)

    def test_public_projects_filter_by_address_and_rooms(self):
        company = self.create_company()
        matching_project = self.create_project(
            company,
            name="Yunus Towers",
            headline="North district launch",
            address="Yunusabad Avenue 10",
            location_label="Yunusabad Central",
        )
        matching_building = self.create_building(matching_project)
        self.create_apartment(
            matching_building,
            apartment_number="A-01-01",
            rooms=2,
            address="Yunusabad Avenue 10",
        )

        non_matching_project = self.create_project(
            company,
            name="Riverside Lofts",
            address="Chilonzor Boulevard 8",
            location_label="Chilonzor South",
        )
        non_matching_building = self.create_building(non_matching_project, code="B", name="Building B")
        self.create_apartment(
            non_matching_building,
            apartment_number="B-02-01",
            rooms=3,
            address="Chilonzor Boulevard 8",
        )

        response = self.client.get(
            "/api/catalog/projects",
            {
                "address_query": "Yunusabad",
                "rooms": "2",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 1)
        self.assertEqual(response.data["results"][0]["name"], "Yunus Towers")

    def test_catalog_lookups_include_project_room_counts(self):
        company = self.create_company()
        first_project = self.create_project(company)
        first_building = self.create_building(first_project)
        self.create_apartment(first_building, apartment_number="A-01-01", rooms=1)

        second_project = self.create_project(company, name="Skyline Court", address="Skyline Street")
        second_building = self.create_building(second_project, code="C", name="Building C")
        self.create_apartment(second_building, apartment_number="C-04-02", rooms=3)

        response = self.client.get("/api/catalog/lookups")

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["project_room_counts"], [1, 3])

    def test_public_apartments_filter_by_address_rooms_price_and_delivery_year(self):
        company = self.create_company()
        matching_project = self.create_project(
            company,
            name="Garden Avenue",
            address="Mirzo Ulugbek Avenue 14",
            location_label="Mirzo Ulugbek",
            delivery_window="Q2 2027",
        )
        matching_building = self.create_building(matching_project)
        matching_apartment = self.create_apartment(
            matching_building,
            apartment_number="A-05-03",
            title="Garden View Two Bedroom",
            address="Mirzo Ulugbek Avenue 14",
            rooms=2,
            price=Decimal("210000.00"),
        )
        second_matching_apartment = self.create_apartment(
            matching_building,
            apartment_number="A-07-01",
            title="Garden View Premium Two Bedroom",
            address="Mirzo Ulugbek Avenue 14",
            rooms=2,
            price=Decimal("220000.00"),
        )

        non_matching_project = self.create_project(
            company,
            name="River West",
            address="Chilonzor Boulevard 8",
            location_label="Chilonzor",
            delivery_window="Q4 2028",
        )
        non_matching_building = self.create_building(non_matching_project, code="B", name="Building B")
        self.create_apartment(
            non_matching_building,
            apartment_number="B-04-01",
            title="River West Three Bedroom",
            address="Chilonzor Boulevard 8",
            rooms=3,
            price=Decimal("320000.00"),
        )

        response = self.client.get(
            "/api/catalog/apartments",
            {
                "address_query": "Mirzo",
                "rooms": "2",
                "min_price": "200000",
                "max_price": "230000",
                "delivery_year": "2027",
                "sort": "price_desc",
            },
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["count"], 2)
        self.assertEqual(
            [item["id"] for item in response.data["results"]],
            [second_matching_apartment.id, matching_apartment.id],
        )

    def test_public_apartments_support_sorting(self):
        company = self.create_company()
        project = self.create_project(company, name="Sorting Residences")
        building = self.create_building(project)

        oldest_apartment = self.create_apartment(
            building,
            apartment_number="A-01-01",
            title="Oldest Residence",
            price=Decimal("320000.00"),
        )
        middle_apartment = self.create_apartment(
            building,
            apartment_number="A-01-02",
            title="Middle Residence",
            price=Decimal("210000.00"),
        )
        newest_apartment = self.create_apartment(
            building,
            apartment_number="A-01-03",
            title="Newest Residence",
            price=Decimal("145000.00"),
        )

        base_time = timezone.now()
        Apartment.objects.filter(pk=oldest_apartment.pk).update(created_at=base_time - timedelta(days=2))
        Apartment.objects.filter(pk=middle_apartment.pk).update(created_at=base_time - timedelta(days=1))
        Apartment.objects.filter(pk=newest_apartment.pk).update(created_at=base_time)

        cases = [
            ("price_asc", [newest_apartment.id, middle_apartment.id, oldest_apartment.id]),
            ("price_desc", [oldest_apartment.id, middle_apartment.id, newest_apartment.id]),
            ("newest", [newest_apartment.id, middle_apartment.id, oldest_apartment.id]),
        ]

        for sort, expected_ids in cases:
            with self.subTest(sort=sort):
                response = self.client.get("/api/catalog/apartments", {"sort": sort})

                self.assertEqual(response.status_code, status.HTTP_200_OK)
                self.assertEqual([item["id"] for item in response.data["results"]], expected_ids)

    def test_non_admin_cannot_write_catalog(self):
        response = self.client.post(
            "/api/catalog/companies",
            {
                "name": "Blocked Company",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_company_patch_preserves_existing_source_language_when_omitted(self):
        self.authenticate()
        company = DeveloperCompany.objects.create(
            name="Dream House",
            name_translations={"en": "Dream House"},
            tagline="Premium residential developer",
            tagline_translations={"en": "Premium residential developer"},
            short_description="Flagship developer profile",
            short_description_translations={"en": "Flagship developer profile"},
            description="Company description",
            description_translations={"en": "Company description"},
            headquarters="Tashkent",
            headquarters_translations={"en": "Tashkent"},
            trust_note="Verified",
            trust_note_translations={"en": "Verified"},
            source_language="en",
            is_verified=True,
        )

        response = self.client.patch(
            f"/api/catalog/companies/{company.slug}",
            {
                "is_active": False,
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        company.refresh_from_db()
        self.assertEqual(company.source_language, "en")
        self.assertEqual(response.data["source_language"], "en")
        self.assertEqual(response.data["translations"]["name"]["en"], "Dream House")
        self.assertFalse(company.is_active)

    def test_admin_can_read_inactive_catalog_records_while_public_cannot(self):
        company = self.create_company()
        project = self.create_project(company, is_active=False)
        building = self.create_building(project, is_active=False)
        company.is_active = False
        company.save(update_fields=["is_active"])

        public_companies_response = self.client.get("/api/catalog/companies")
        public_projects_response = self.client.get("/api/catalog/projects")
        public_buildings_response = self.client.get("/api/catalog/buildings")
        public_company_detail_response = self.client.get(f"/api/catalog/companies/{company.slug}")
        public_project_detail_response = self.client.get(f"/api/catalog/projects/{project.slug}")
        public_building_detail_response = self.client.get(f"/api/catalog/buildings/{building.slug}")

        self.assertEqual(public_companies_response.status_code, status.HTTP_200_OK)
        self.assertEqual(public_projects_response.status_code, status.HTTP_200_OK)
        self.assertEqual(public_buildings_response.status_code, status.HTTP_200_OK)
        self.assertEqual(public_companies_response.data["count"], 0)
        self.assertEqual(public_projects_response.data["count"], 0)
        self.assertEqual(public_buildings_response.data["count"], 0)
        self.assertEqual(public_company_detail_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(public_project_detail_response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertEqual(public_building_detail_response.status_code, status.HTTP_404_NOT_FOUND)

        self.authenticate()

        admin_companies_response = self.client.get("/api/catalog/companies")
        admin_projects_response = self.client.get("/api/catalog/projects")
        admin_buildings_response = self.client.get("/api/catalog/buildings")
        admin_company_detail_response = self.client.get(f"/api/catalog/companies/{company.slug}")
        admin_project_detail_response = self.client.get(f"/api/catalog/projects/{project.slug}")
        admin_building_detail_response = self.client.get(f"/api/catalog/buildings/{building.slug}")
        admin_lookups_response = self.client.get("/api/catalog/lookups")

        self.assertEqual(admin_companies_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_projects_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_buildings_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_company_detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_project_detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_building_detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_lookups_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_companies_response.data["results"][0]["id"], company.id)
        self.assertEqual(admin_projects_response.data["results"][0]["id"], project.id)
        self.assertEqual(admin_buildings_response.data["results"][0]["id"], building.id)
        self.assertEqual(admin_company_detail_response.data["id"], company.id)
        self.assertEqual(admin_project_detail_response.data["id"], project.id)
        self.assertEqual(admin_building_detail_response.data["id"], building.id)
        self.assertEqual(admin_lookups_response.data["companies"][0]["id"], company.id)
        self.assertEqual(admin_lookups_response.data["projects"][0]["id"], project.id)
        self.assertEqual(admin_lookups_response.data["buildings"][0]["id"], building.id)

    def test_admin_can_delete_apartment(self):
        self.authenticate()
        company = self.create_company()
        project = self.create_project(company)
        building = self.create_building(project)
        apartment = self.create_apartment(building)

        response = self.client.delete(f"/api/catalog/apartments/{apartment.slug}")

        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Apartment.objects.filter(pk=apartment.pk).exists())

    def test_admin_can_upload_catalog_image(self):
        self.authenticate()

        with tempfile.TemporaryDirectory() as media_root:
            upload = SimpleUploadedFile("catalog-logo.png", b"fake-image-content", content_type="image/png")

            with override_settings(MEDIA_ROOT=media_root):
                response = self.client.post(
                    "/api/catalog/uploads/images",
                    {"file": upload},
                    format="multipart",
                )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(response.data["image_url"].endswith(".png"))
        self.assertIn("catalog/", response.data["storage_key"])
