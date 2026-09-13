from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0008_update_homepage_heading"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontent",
            name="announcement",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Site-wide announcement banner: enabled flag, message, and colour variant.",
            ),
        ),
    ]
