from django.utils.text import slugify


def generate_unique_slug(instance, value: str, slug_field: str = "slug") -> str:
    base_slug = slugify(value) or "item"
    slug = base_slug
    suffix = 1
    manager = instance.__class__._default_manager

    while manager.filter(**{slug_field: slug}).exclude(pk=instance.pk).exists():
        suffix += 1
        slug = f"{base_slug}-{suffix}"

    return slug
