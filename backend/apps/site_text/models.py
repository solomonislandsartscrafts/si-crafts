from django.db import models


class SiteText(models.Model):
    """One editable string of website copy, addressed by a stable key.

    Deliberately a key/value table rather than another wide singleton like
    SiteContent. The site has well over a hundred editable strings (page
    intros, section headings, CTA bands, notices, provenance copy); as columns
    that would be a migration and five lines of boilerplate per string. Here the
    frontend owns a typed manifest (src/lib/site-text-manifest.ts) that declares
    every key, its label, its group and its default copy, so adding a new
    editable string is a one-line change with no database work.

    The manifest is also the fallback: a key that is missing or blank falls back
    to the default copy shipped in the manifest, so the public site never renders
    a blank heading and admins see real text to edit rather than empty boxes.
    """

    key = models.CharField(max_length=100, unique=True, db_index=True)
    value = models.TextField(blank=True, default="")
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["key"]
        verbose_name = "Site Text"
        verbose_name_plural = "Site Text"

    def __str__(self):
        return self.key
