from django.db import models


class RetailStockist(models.Model):
    """A museum or gallery shop listed publicly on the Stockists page.

    Distinct from apps.stockists.Stockist, which is a wholesale account with a
    login. This is a directory entry: third-party contact details and opening
    hours that change without notice, which is exactly why it must not live in
    code.
    """

    name = models.CharField(max_length=200)
    city = models.CharField(max_length=120, blank=True, default="")
    url = models.CharField(max_length=500, blank=True, default="")
    address = models.CharField(max_length=400, blank=True, default="")
    phone = models.CharField(max_length=60, blank=True, default="")
    email = models.CharField(max_length=200, blank=True, default="")
    hours = models.CharField(max_length=200, blank=True, default="")
    closed = models.CharField(max_length=200, blank=True, default="")
    sort_order = models.PositiveIntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["sort_order", "name"]
        verbose_name = "Retail Stockist"
        verbose_name_plural = "Retail Stockists"

    def __str__(self):
        return self.name
