from io import StringIO

from django.core.management import call_command
from django.test import TestCase

from apps.locations.models import LocationCity, LocationDistrict


class SeedUzbekistanLocationsCommandTests(TestCase):
    def test_seed_command_creates_expected_locations(self):
        out = StringIO()

        call_command("seed_uzbekistan_locations", stdout=out)

        self.assertEqual(LocationCity.objects.filter(country_code="UZ").count(), 14)
        self.assertTrue(LocationCity.objects.filter(name="Tashkent City").exists())
        self.assertTrue(
            LocationDistrict.objects.filter(city__name="Tashkent City", name="Yunusobod", is_active=True).exists()
        )
        self.assertTrue(
            LocationDistrict.objects.filter(city__name="Karakalpakstan Republic", name="Bozatov", is_active=True).exists()
        )

    def test_seed_command_is_idempotent_and_deactivates_stale_districts(self):
        city = LocationCity.objects.create(name="Tashkent City", country_code="UZ")
        LocationDistrict.objects.create(city=city, name="Yunusobod")
        stale = LocationDistrict.objects.create(city=city, name="Legacy District")

        call_command("seed_uzbekistan_locations")
        call_command("seed_uzbekistan_locations")

        self.assertEqual(LocationCity.objects.filter(country_code="UZ").count(), 14)
        self.assertEqual(LocationDistrict.objects.filter(city=city, name="Yunusobod").count(), 1)
        stale.refresh_from_db()
        self.assertFalse(stale.is_active)

    def test_replace_option_reseeds_from_clean_state(self):
        city = LocationCity.objects.create(name="Custom City", country_code="UZ")
        LocationDistrict.objects.create(city=city, name="Custom District")

        call_command("seed_uzbekistan_locations", "--replace")

        self.assertFalse(LocationCity.objects.filter(name="Custom City").exists())
        self.assertEqual(LocationCity.objects.filter(country_code="UZ").count(), 14)
