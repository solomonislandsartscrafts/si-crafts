from django.db import models


class SiteContent(models.Model):
    """Singleton model for site-wide editable content.

    Covers images (About page) and text content for all major pages.
    Admins edit these via the Site Content admin panel.
    """

    # --- About page images (existing) ---
    about_solomon_islands_image_url = models.CharField(max_length=500, blank=True, default="")
    about_solomon_islands_image_alt = models.CharField(max_length=300, blank=True, default="")
    about_team_image_url = models.CharField(max_length=500, blank=True, default="")
    about_team_image_alt = models.CharField(max_length=300, blank=True, default="")
    why_we_do_this_image_url = models.CharField(max_length=500, blank=True, default="")
    why_we_do_this_image_alt = models.CharField(max_length=300, blank=True, default="")

    # --- Homepage ---
    homepage_heading = models.CharField(max_length=200, blank=True, default="")
    homepage_intro = models.TextField(blank=True, default="")
    homepage_cta_text = models.CharField(max_length=100, blank=True, default="")
    homepage_makers_heading = models.CharField(max_length=200, blank=True, default="")
    homepage_makers_intro = models.TextField(blank=True, default="")

    # --- About page text ---
    about_page_intro = models.TextField(blank=True, default="")
    about_solomon_islands_text = models.TextField(blank=True, default="")
    about_team_text = models.TextField(blank=True, default="")
    about_why_text = models.TextField(blank=True, default="")

    # --- Wholesale page ---
    wholesale_intro = models.TextField(blank=True, default="")
    wholesale_how_it_works = models.TextField(blank=True, default="")
    wholesale_minimum_order = models.CharField(max_length=200, blank=True, default="")

    # --- Care Guide page ---
    care_guide_intro = models.TextField(blank=True, default="")
    care_guide_pandanus = models.TextField(blank=True, default="")
    care_guide_wood = models.TextField(blank=True, default="")
    care_guide_shell = models.TextField(blank=True, default="")

    # --- Contact page ---
    contact_intro = models.TextField(blank=True, default="")
    contact_email = models.CharField(max_length=200, blank=True, default="")
    contact_response_time = models.CharField(max_length=200, blank=True, default="")

    class Meta:
        verbose_name = "Site Content"
        verbose_name_plural = "Site Content"

    def save(self, *args, **kwargs):
        # Enforce singleton — always use pk=1
        self.pk = 1
        super().save(*args, **kwargs)

    @classmethod
    def load(cls):
        obj, _ = cls.objects.get_or_create(pk=1)
        return obj

    def __str__(self):
        return "Site Content"
