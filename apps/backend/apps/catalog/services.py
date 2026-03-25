from django.db import transaction

from apps.catalog.models import Apartment, ApartmentImage, ApartmentPaymentOption


@transaction.atomic
def sync_apartment_relations(
    *,
    apartment: Apartment,
    image_urls: list[str],
    uploaded_images: list[dict[str, str]],
    payment_options: list[dict[str, str]],
):
    ApartmentImage.objects.filter(apartment=apartment).delete()

    combined_images = list(uploaded_images)
    combined_images.extend(
        {
            "image_url": image_url,
            "storage_key": "",
        }
        for image_url in image_urls
    )

    for index, image in enumerate(combined_images):
        ApartmentImage.objects.create(
            apartment=apartment,
            image_url=image["image_url"],
            storage_key=image.get("storage_key", ""),
            sort_order=index,
            is_primary=index == 0,
        )

    ApartmentPaymentOption.objects.filter(apartment=apartment).delete()
    for option in payment_options:
        ApartmentPaymentOption.objects.create(
            apartment=apartment,
            payment_type=option["payment_type"],
            notes=option.get("notes", ""),
        )
