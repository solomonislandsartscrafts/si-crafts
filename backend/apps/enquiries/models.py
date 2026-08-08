from django.db import models


class MakerEnquiry(models.Model):
    """Enquiry from a potential maker wanting to work with SIAC."""

    name = models.CharField(max_length=200)
    village = models.CharField(max_length=200)
    province = models.CharField(max_length=200)
    craft = models.CharField(max_length=200)
    message = models.TextField()
    contact = models.CharField(max_length=200)
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Maker Enquiry"
        verbose_name_plural = "Maker Enquiries"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Maker enquiry from {self.name}"


class StockistRequest(models.Model):
    """Request from an approved stockist (replacement tags, custom bulk, etc.)."""

    stockist = models.ForeignKey(
        "stockists.Stockist", on_delete=models.CASCADE, related_name="requests"
    )
    request_data = models.JSONField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Stockist Request"
        verbose_name_plural = "Stockist Requests"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Request from {self.stockist.business_name}"


class ContactEnquiry(models.Model):
    """General contact form submission."""

    REASON_CHOICES = [
        ("general", "General"),
        ("wholesale", "Wholesale"),
        ("media", "Media"),
        ("other", "Other"),
    ]

    name = models.CharField(max_length=200)
    email = models.EmailField()
    reason = models.CharField(max_length=20, choices=REASON_CHOICES, default="general")
    message = models.TextField()
    submitted_at = models.DateTimeField(auto_now_add=True)
    handled = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Contact Enquiry"
        verbose_name_plural = "Contact Enquiries"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"Contact from {self.name} ({self.reason})"
