from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0009_add_announcement"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontent",
            name="site_logo_url",
            field=models.CharField(blank=True, default="", max_length=500),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="site_logo_alt",
            field=models.CharField(blank=True, default="", max_length=300),
        ),
    ]
