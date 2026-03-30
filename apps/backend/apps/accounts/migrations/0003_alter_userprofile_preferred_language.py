from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("accounts", "0002_user_is_superuser_alter_user_groups_and_more"),
    ]

    operations = [
        migrations.AlterField(
            model_name="userprofile",
            name="preferred_language",
            field=models.CharField(default="uz", max_length=16),
        ),
    ]
