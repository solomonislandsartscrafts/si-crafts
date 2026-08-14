from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0004_add_alt_text_fields"),
    ]

    operations = [
        # Homepage
        migrations.AddField(
            model_name="sitecontent",
            name="homepage_heading",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="homepage_intro",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="homepage_cta_text",
            field=models.CharField(max_length=100, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="homepage_makers_heading",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="homepage_makers_intro",
            field=models.TextField(blank=True, default=""),
        ),
        # About page text
        migrations.AddField(
            model_name="sitecontent",
            name="about_page_intro",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="about_solomon_islands_text",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="about_team_text",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="about_why_text",
            field=models.TextField(blank=True, default=""),
        ),
        # Wholesale page
        migrations.AddField(
            model_name="sitecontent",
            name="wholesale_intro",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="wholesale_how_it_works",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="wholesale_minimum_order",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
        # Care Guide page
        migrations.AddField(
            model_name="sitecontent",
            name="care_guide_intro",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="care_guide_pandanus",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="care_guide_wood",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="care_guide_shell",
            field=models.TextField(blank=True, default=""),
        ),
        # Contact page
        migrations.AddField(
            model_name="sitecontent",
            name="contact_intro",
            field=models.TextField(blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="contact_email",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
        migrations.AddField(
            model_name="sitecontent",
            name="contact_response_time",
            field=models.CharField(max_length=200, blank=True, default=""),
        ),
    ]
