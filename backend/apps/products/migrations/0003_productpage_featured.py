from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("products", "0002_productpage_image_alts_productpage_image_urls"),
    ]

    operations = [
        migrations.AddField(
            model_name="productpage",
            name="featured",
            field=models.BooleanField(
                default=False,
                help_text="Show this product in the homepage hero gallery (max 3 recommended).",
            ),
        ),
    ]
