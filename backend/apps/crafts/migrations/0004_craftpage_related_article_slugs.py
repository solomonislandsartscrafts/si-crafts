from django.db import migrations, models


def seed_slugs_from_single(apps, schema_editor):
    """Seed the new ordered list from any non-empty single slug value."""
    CraftPage = apps.get_model("crafts", "CraftPage")
    for craft in CraftPage.objects.all():
        single = (craft.related_article_slug or "").strip()
        if single:
            craft.related_article_slugs = [single]
            craft.save(update_fields=["related_article_slugs"])


class Migration(migrations.Migration):

    dependencies = [
        ("crafts", "0003_craftpage_related_article_slug"),
    ]

    operations = [
        migrations.AddField(
            model_name="craftpage",
            name="related_article_slugs",
            field=models.JSONField(blank=True, default=list),
        ),
        migrations.RunPython(seed_slugs_from_single, migrations.RunPython.noop),
        migrations.RemoveField(
            model_name="craftpage",
            name="related_article_slug",
        ),
    ]
