from django.core.management.base import BaseCommand
from django.db import transaction

from apps.locations.data import UZBEKISTAN_LOCATION_DATA
from apps.locations.models import LocationCity, LocationDistrict


class Command(BaseCommand):
    help = "Seed Uzbekistan cities and districts into the locations tables."

    def add_arguments(self, parser):
        parser.add_argument(
            "--replace",
            action="store_true",
            help="Delete existing Uzbekistan location records before reseeding them.",
        )

    @transaction.atomic
    def handle(self, *args, **options):
        if options["replace"]:
            districts_deleted, _ = LocationDistrict.objects.filter(city__country_code="UZ").delete()
            cities_deleted, _ = LocationCity.objects.filter(country_code="UZ").delete()
            self.stdout.write(self.style.WARNING(f"Removed {cities_deleted} cities and {districts_deleted} districts."))

        created_cities = 0
        updated_cities = 0
        created_districts = 0
        updated_districts = 0

        for city_data in UZBEKISTAN_LOCATION_DATA:
            city, created = LocationCity.objects.get_or_create(
                name=city_data["name"],
                defaults={"country_code": "UZ", "is_active": True},
            )
            city.country_code = "UZ"
            city.is_active = True
            city.save(update_fields=["country_code", "is_active"])
            if created:
                created_cities += 1
            else:
                updated_cities += 1

            existing_names = set(city.districts.values_list("name", flat=True))
            target_names = set(city_data["districts"])

            for district_name in city_data["districts"]:
                _, district_created = LocationDistrict.objects.get_or_create(
                    city=city,
                    name=district_name,
                    defaults={"is_active": True},
                )
                if district_created:
                    created_districts += 1
                else:
                    updated = city.districts.filter(name=district_name).exclude(is_active=True).update(is_active=True)
                    updated_districts += 1 if updated else 0

            stale_names = existing_names - target_names
            if stale_names:
                updated_districts += city.districts.filter(name__in=stale_names, is_active=True).update(is_active=False)

        self.stdout.write(
            self.style.SUCCESS(
                f"Uzbekistan locations ready: {created_cities} cities created, {updated_cities} cities refreshed, "
                f"{created_districts} districts created, {updated_districts} districts refreshed."
            )
        )
