from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0006_add_about_headings_and_links"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontent",
            name="slideshow_settings",
            field=models.JSONField(
                blank=True,
                default=dict,
                help_text="Homepage slideshow configuration: enabled categories and per-item toggles.",
            ),
        ),
    ]
