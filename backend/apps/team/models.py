from django.db import models


class TeamMember(models.Model):
    """A member of the SIAC volunteer team."""

    name = models.CharField(max_length=200)
    location = models.CharField(max_length=200, blank=True, default="")
    bio = models.TextField(blank=True, default="")
    photo_url = models.CharField(max_length=500, blank=True, default="")
    photo_alt = models.CharField(max_length=300, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Team Member"
        verbose_name_plural = "Team Members"

    def __str__(self):
        return self.name
