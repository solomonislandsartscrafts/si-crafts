from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0010_add_site_logo"),
    ]

    operations = [
        migrations.AddField(
            model_name="sitecontent",
            name="show_supporters",
            field=models.BooleanField(default=True),
        ),
    ]
