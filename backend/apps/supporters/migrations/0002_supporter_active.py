from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("supporters", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="supporter",
            name="active",
            field=models.BooleanField(default=True),
        ),
    ]
