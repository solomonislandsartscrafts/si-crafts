from django.db import models


class Supporter(models.Model):
    """A confirmed supporter whose logo appears in the homepage banner.

    The banner hides itself when there are no rows, so an empty table is a valid
    state — better than claiming backing that does not exist.
    """

    name = models.CharField(max_length=200)
    logo_url = models.CharField(max_length=500, blank=True, default="")
    logo_alt = models.CharField(max_length=300, blank=True, default="")
    href = models.CharField(max_length=500, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    # Suspended supporters stay in the table (and the admin list) but are hidden
    # from the public homepage banner. Lets an admin take a logo down without
    # losing the record — the alternative was deleting and re-adding it.
    active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Supporter"
        verbose_name_plural = "Supporters"

    def __str__(self):
        return self.name
