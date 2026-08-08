from django.db import models


class MaterialCategory(models.Model):
    """Admin-managed material category for products and crafts."""

    value = models.SlugField(max_length=50, unique=True)
    label = models.CharField(max_length=100)
    code_initial = models.CharField(max_length=3, help_text="Letter(s) used in product codes")

    class Meta:
        verbose_name = "Material Category"
        verbose_name_plural = "Material Categories"
        ordering = ["label"]

    def __str__(self):
        return self.label


class ProductType(models.Model):
    """Admin-managed product type."""

    value = models.SlugField(max_length=50, unique=True)
    label = models.CharField(max_length=100)

    class Meta:
        verbose_name = "Product Type"
        verbose_name_plural = "Product Types"
        ordering = ["label"]

    def __str__(self):
        return self.label
