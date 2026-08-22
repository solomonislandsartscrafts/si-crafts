from django.db import models
from django.db.models.functions import Lower
from django.contrib.auth.models import User


class Stockist(models.Model):
    """An approved wholesale buyer (museum/gallery shop)."""

    STATUS_CHOICES = [
        ("pending", "Pending"),
        ("approved", "Approved"),
        ("suspended", "Suspended"),
        ("rejected", "Rejected"),
    ]

    user = models.OneToOneField(
        User, null=True, blank=True, on_delete=models.SET_NULL, related_name="stockist"
    )
    business_name = models.CharField(max_length=300)
    abn = models.CharField(max_length=11, blank=True)
    contact_name = models.CharField(max_length=200)
    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, blank=True)
    description = models.TextField(max_length=500, blank=True)
    profile_image_url = models.CharField(max_length=500, blank=True, default="")
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="pending")
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Stockist"
        verbose_name_plural = "Stockists"
        ordering = ["-created_at"]
        constraints = [
            # `unique=True` on the column is case-SENSITIVE, but every lookup
            # (login, password reset, duplicate-application check) matches with
            # `iexact`. Without this, two rows differing only in case could both
            # exist and those lookups would pick between them arbitrarily.
            models.UniqueConstraint(
                Lower("email"), name="stockist_email_ci_unique"
            ),
        ]

    def __str__(self):
        return f"{self.business_name} ({self.status})"


class PasswordSetToken(models.Model):
    """One-time token for a stockist to set their password after approval."""

    stockist = models.ForeignKey(Stockist, on_delete=models.CASCADE, related_name="password_tokens")
    token = models.CharField(max_length=64, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Password Set Token"

    def __str__(self):
        return f"Token for {self.stockist.email} ({'used' if self.used else 'active'})"

    @property
    def is_valid(self):
        """Token is valid for 7 days and hasn't been used."""
        from django.utils import timezone
        from datetime import timedelta
        if self.used:
            return False
        return timezone.now() - self.created_at < timedelta(days=7)
