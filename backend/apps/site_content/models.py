from django.db import models


class SiteContent(models.Model):
    """Singleton model for site-wide content (about page images, etc.)."""

    about_solomon_islands_image_url = models.CharField(max_length=500, blank=True, default="")
    about_solomon_islands_image_alt = models.CharField(max_length=300, blank=True, default="")
    about_team_image_url = models.CharField(max_length=500, blank=True, default="")
    about_team_image_alt = models.CharField(max_length=300, blank=True, default="")
    why_we_do_this_image_url = models.CharField(max_length=500, blank=True, default="")
    why_we_do_this_image_alt = models.CharField(max_length=300, blank=True, default="")

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
