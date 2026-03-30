from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("listings", "0002_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="listing",
            name="address_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="listing",
            name="description_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="listing",
            name="source_language",
            field=models.CharField(default="uz", max_length=16),
        ),
        migrations.AddField(
            model_name="listing",
            name="title_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="listing",
            name="translation_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="listing",
            name="translation_state",
            field=models.CharField(
                choices=[
                    ("not_requested", "Not requested"),
                    ("pending", "Pending"),
                    ("completed", "Completed"),
                    ("failed", "Failed"),
                    ("stale", "Stale"),
                ],
                default="not_requested",
                max_length=32,
            ),
        ),
        migrations.AddField(
            model_name="listing",
            name="translation_status_map",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="listing",
            name="translation_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
