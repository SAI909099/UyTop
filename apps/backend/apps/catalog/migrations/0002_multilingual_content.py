from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("catalog", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="apartment",
            name="address_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="apartment",
            name="description_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="apartment",
            name="source_language",
            field=models.CharField(default="uz", max_length=16),
        ),
        migrations.AddField(
            model_name="apartment",
            name="title_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="apartment",
            name="translation_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="apartment",
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
            model_name="apartment",
            name="translation_status_map",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="apartment",
            name="translation_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="description_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="headquarters_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="name_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="short_description_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="source_language",
            field=models.CharField(default="uz", max_length=16),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="tagline_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="translation_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="developercompany",
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
            model_name="developercompany",
            name="translation_status_map",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="translation_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="developercompany",
            name="trust_note_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="handover_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="name_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="source_language",
            field=models.CharField(default="uz", max_length=16),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="summary_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="translation_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="projectbuilding",
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
            model_name="projectbuilding",
            name="translation_status_map",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="projectbuilding",
            name="translation_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="address_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="delivery_window_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="description_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="headline_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="location_label_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="name_translations",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="source_language",
            field=models.CharField(default="uz", max_length=16),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="translation_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="residentialproject",
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
            model_name="residentialproject",
            name="translation_status_map",
            field=models.JSONField(blank=True, default=dict),
        ),
        migrations.AddField(
            model_name="residentialproject",
            name="translation_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
