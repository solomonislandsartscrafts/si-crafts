from django.db import models


class OrderRequest(models.Model):
    """A wholesale order request from a stockist."""

    STATUS_CHOICES = [
        ("Submitted", "Submitted"),
        ("Confirmed", "Confirmed"),
        ("Shipped", "Shipped"),
        ("Completed", "Completed"),
        ("Cancelled", "Cancelled"),
    ]

    reference_number = models.CharField(max_length=20, unique=True)
    stockist = models.ForeignKey(
        "stockists.Stockist", on_delete=models.CASCADE, related_name="orders"
    )
    total_aud = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Submitted")
    notes = models.TextField(blank=True)
    submitted_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Order Request"
        verbose_name_plural = "Order Requests"
        ordering = ["-submitted_at"]

    def __str__(self):
        return f"{self.reference_number} — {self.stockist.business_name}"


class OrderItem(models.Model):
    """A line item within an order request."""

    order = models.ForeignKey(OrderRequest, on_delete=models.CASCADE, related_name="items")
    product_code = models.CharField(max_length=20)
    product_name = models.CharField(max_length=300)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        verbose_name = "Order Item"
        verbose_name_plural = "Order Items"

    def __str__(self):
        return f"{self.product_code} x{self.quantity}"

    @property
    def line_total(self):
        return self.quantity * self.unit_price
