from decimal import Decimal

from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APIClient, APITestCase

from apps.interactions.models import Favorite, SavedSearch
from apps.listings.models import Amenity, Listing, ListingCategory, ListingModerationStatus, ListingPurpose, ListingStatus
from apps.locations.models import LocationCity, LocationDistrict
from apps.moderation.models import ListingReport, ReportStatus


User = get_user_model()


class BaseApiTestCase(APITestCase):
    def setUp(self):
        self.client = APIClient()
        self.city = LocationCity.objects.create(name="Tashkent", country_code="UZ")
        self.district = LocationDistrict.objects.create(city=self.city, name="Yunusabad")
        self.amenity = Amenity.objects.create(title="Parking")

        self.owner = User.objects.create_user(
            email="owner@example.com",
            phone_number="+998900000001",
            password="StrongPass123",
            role="owner",
            first_name="Owner",
            last_name="User",
        )
        self.user = User.objects.create_user(
            email="user@example.com",
            phone_number="+998900000002",
            password="StrongPass123",
            role="user",
            first_name="Buyer",
            last_name="User",
        )
        self.admin = User.objects.create_user(
            email="admin@example.com",
            phone_number="+998900000003",
            password="StrongPass123",
            role="admin",
            is_staff=True,
            first_name="Admin",
            last_name="User",
        )

    def authenticate(self, user):
        self.client.force_authenticate(user=user)

    def create_listing(self, **overrides):
        defaults = {
            "owner": self.owner,
            "purpose": ListingPurpose.SALE,
            "category": ListingCategory.APARTMENT,
            "title": "Test Apartment",
            "description": "Nice place",
            "price": Decimal("120000.00"),
            "currency": "USD",
            "address": "Sample Street 1",
            "city": self.city,
            "district": self.district,
            "latitude": Decimal("41.311081"),
            "longitude": Decimal("69.240562"),
            "rooms": 3,
            "size_sqm": Decimal("95.00"),
            "contact_phone": self.owner.phone_number,
            "allow_phone": True,
            "status": ListingStatus.ACTIVE,
            "moderation_status": ListingModerationStatus.APPROVED,
        }
        defaults.update(overrides)
        return Listing.objects.create(**defaults)


class AuthApiTests(BaseApiTestCase):
    def test_register_returns_tokens_and_user(self):
        response = self.client.post(
            "/api/auth/register/",
            {
                "email": "new-owner@example.com",
                "phone_number": "+998900000004",
                "password": "StrongPass123",
                "role": "owner",
                "first_name": "New",
                "last_name": "Owner",
                "preferred_language": "en",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn("access", response.data)
        self.assertIn("refresh", response.data)
        self.assertEqual(response.data["user"]["role"], "owner")

    def test_login_accepts_email_or_phone(self):
        email_response = self.client.post(
            "/api/auth/token/",
            {"identifier": "owner@example.com", "password": "StrongPass123"},
            format="json",
        )
        phone_response = self.client.post(
            "/api/auth/token/",
            {"identifier": "+998900000001", "password": "StrongPass123"},
            format="json",
        )

        self.assertEqual(email_response.status_code, status.HTTP_200_OK)
        self.assertEqual(phone_response.status_code, status.HTTP_200_OK)

    def test_me_update_updates_profile_fields(self):
        self.authenticate(self.owner)

        response = self.client.put(
            "/api/auth/me/",
            {
                "first_name": "Updated",
                "city": "Tashkent",
                "district": "Yunusabad",
                "preferred_language": "uz",
            },
            format="json",
        )

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.owner.refresh_from_db()
        self.assertEqual(self.owner.first_name, "Updated")
        self.assertEqual(self.owner.profile.preferred_language, "uz")


class ListingApiTests(BaseApiTestCase):
    def test_owner_can_create_listing_and_submit_for_review(self):
        self.authenticate(self.owner)
        create_response = self.client.post(
            "/api/listings",
            {
                "purpose": "sale",
                "category": "apartment",
                "title": "Owner Listing",
                "description": "A good listing",
                "price": "150000.00",
                "currency": "USD",
                "address": "Street 10",
                "city_id": self.city.id,
                "district_id": self.district.id,
                "latitude": "41.310000",
                "longitude": "69.240000",
                "rooms": 4,
                "size_sqm": "120.00",
                "condition": "good",
                "furnished": True,
                "allow_phone": True,
                "allow_whatsapp": True,
                "contact_phone": self.owner.phone_number,
                "amenity_ids": [self.amenity.id],
                "image_urls": ["https://example.com/image-1.jpg"],
            },
            format="json",
        )

        self.assertEqual(create_response.status_code, status.HTTP_201_CREATED)
        listing_id = create_response.data["id"]

        submit_response = self.client.patch(f"/api/listings/{listing_id}/submit-for-review")
        self.assertEqual(submit_response.status_code, status.HTTP_200_OK)
        self.assertEqual(submit_response.data["moderation_status"], "pending_review")

    def test_admin_can_approve_and_owner_can_mark_sold(self):
        listing = self.create_listing(status=ListingStatus.DRAFT, moderation_status=ListingModerationStatus.PENDING_REVIEW)

        self.authenticate(self.admin)
        approve_response = self.client.patch(f"/api/admin/listings/{listing.id}/approve", {"notes": "Looks fine"}, format="json")
        self.assertEqual(approve_response.status_code, status.HTTP_200_OK)
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.ACTIVE)
        self.assertEqual(listing.moderation_status, ListingModerationStatus.APPROVED)

        self.authenticate(self.owner)
        sold_response = self.client.patch(f"/api/listings/{listing.id}/mark-sold")
        self.assertEqual(sold_response.status_code, status.HTTP_200_OK)
        listing.refresh_from_db()
        self.assertEqual(listing.status, ListingStatus.SOLD)

    def test_public_list_and_map_only_show_approved_listings_in_bounds(self):
        self.create_listing(title="Visible Listing", latitude=Decimal("41.311081"), longitude=Decimal("69.240562"))
        self.create_listing(
            title="Hidden Draft",
            status=ListingStatus.DRAFT,
            moderation_status=ListingModerationStatus.PENDING_REVIEW,
            latitude=Decimal("41.300000"),
            longitude=Decimal("69.200000"),
        )
        self.create_listing(
            title="Outside Bounds",
            latitude=Decimal("42.000000"),
            longitude=Decimal("70.000000"),
        )

        list_response = self.client.get("/api/listings")
        map_response = self.client.get(
            "/api/map/listings",
            {
                "north": "41.5",
                "south": "41.0",
                "east": "69.5",
                "west": "69.0",
            },
        )

        self.assertEqual(list_response.status_code, status.HTTP_200_OK)
        self.assertEqual(list_response.data["count"], 2)
        self.assertEqual(map_response.status_code, status.HTTP_200_OK)
        self.assertEqual(map_response.data["count"], 1)


class InteractionAndModerationApiTests(BaseApiTestCase):
    def test_detail_view_tracks_recently_viewed_and_favorites(self):
        listing = self.create_listing()

        self.authenticate(self.user)
        detail_response = self.client.get(f"/api/listings/{listing.id}")
        favorite_response = self.client.post(f"/api/favorites/{listing.id}")
        recent_response = self.client.get("/api/recently-viewed")
        favorites_response = self.client.get("/api/favorites")

        self.assertEqual(detail_response.status_code, status.HTTP_200_OK)
        self.assertEqual(favorite_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(recent_response.status_code, status.HTTP_200_OK)
        self.assertEqual(recent_response.data["count"], 1)
        self.assertEqual(favorites_response.data["count"], 1)
        self.assertTrue(Favorite.objects.filter(user=self.user, listing=listing).exists())

    def test_saved_search_and_report_creation(self):
        listing = self.create_listing()

        self.authenticate(self.user)
        search_response = self.client.post(
            "/api/saved-searches",
            {
                "name": "Apartments in Tashkent",
                "purpose": "sale",
                "category": "apartment",
                "city_id": self.city.id,
                "district_id": self.district.id,
                "price_min": "100000.00",
                "price_max": "200000.00",
                "featured_only": False,
                "verified_owners_only": False,
                "alerts_enabled": True,
                "sort_by": "newest",
            },
            format="json",
        )
        report_response = self.client.post(
            "/api/reports",
            {
                "listing": listing.id,
                "reason": "fake",
                "details": "This looks suspicious",
            },
            format="json",
        )

        self.assertEqual(search_response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(report_response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(SavedSearch.objects.filter(user=self.user).exists())
        self.assertTrue(ListingReport.objects.filter(listing=listing, reporter=self.user, status=ReportStatus.OPEN).exists())

        self.authenticate(self.admin)
        admin_reports_response = self.client.get("/api/admin/reports")
        self.assertEqual(admin_reports_response.status_code, status.HTTP_200_OK)
        self.assertEqual(admin_reports_response.data["count"], 1)
