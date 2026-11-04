from decimal import Decimal

from django.contrib.auth import get_user_model
from django.test import TestCase
from rest_framework import status
from rest_framework.test import APIClient
from wagtail.models import Page

from apps.accounts.models import AdminProfile
from apps.stockists.models import Stockist
from .models import ProductPage

User = get_user_model()

PRICES_URL = "/api/write/products/prices/"


class WholesalePriceVisibilityTest(TestCase):
    """Wholesale prices must never reach anonymous visitors (business rule)."""

    def setUp(self):
        self.client = APIClient()
        root = Page.objects.filter(depth=1).first()
        parent = root.get_children().first() or root
        self.published = parent.add_child(instance=ProductPage(
            title="Pandanus basket", slug="test-pandanus-basket",
            product_code="T-T-1", description="<p>Test</p>",
            material_category="pandanus", product_type="basket",
            wholesale_price=Decimal("60.00"), published_flag=True,
        ))
        self.unpublished = parent.add_child(instance=ProductPage(
            title="Draft carving", slug="test-draft-carving",
            product_code="T-T-2", description="<p>Test</p>",
            material_category="wood", product_type="carving",
            wholesale_price=Decimal("85.50"), published_flag=False,
        ))

    def _stockist(self, status_value):
        user = User.objects.create_user(username=f"stockist_{status_value}", password="x")
        Stockist.objects.create(
            user=user, business_name="Museum Shop", contact_name="Test",
            email=f"{status_value}@example.com", status=status_value,
        )
        return user

    # --- public v2 API ---

    def test_default_listing_has_no_price(self):
        response = self.client.get("/api/v2/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["items"])
        self.assertNotIn("wholesale_price", response.content.decode())

    def test_fields_star_has_no_price(self):
        response = self.client.get("/api/v2/products/?fields=*")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertTrue(response.json()["items"])
        self.assertNotIn("wholesale_price", response.content.decode())

    def test_explicit_price_field_is_rejected(self):
        response = self.client.get("/api/v2/products/?fields=wholesale_price")
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertNotIn("60.00", response.content.decode())

    def test_detail_has_no_price(self):
        response = self.client.get(f"/api/v2/products/{self.published.id}/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertNotIn("wholesale_price", response.content.decode())

    # --- authenticated price endpoint ---

    def test_prices_anonymous_is_401(self):
        response = self.client.get(PRICES_URL)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_prices_user_without_profile_is_403(self):
        self.client.force_authenticate(User.objects.create_user(username="nobody", password="x"))
        self.assertEqual(self.client.get(PRICES_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_prices_pending_stockist_is_403(self):
        self.client.force_authenticate(self._stockist("pending"))
        self.assertEqual(self.client.get(PRICES_URL).status_code, status.HTTP_403_FORBIDDEN)

    def test_prices_approved_stockist_sees_published_only(self):
        self.client.force_authenticate(self._stockist("approved"))
        response = self.client.get(PRICES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        by_id = {row["id"]: row for row in response.json()}
        self.assertIn(self.published.id, by_id)
        self.assertNotIn(self.unpublished.id, by_id)
        self.assertEqual(Decimal(str(by_id[self.published.id]["wholesale_price"])), Decimal("60.00"))

    def test_prices_admin_sees_all(self):
        user = User.objects.create_user(username="admin_prices", password="x")
        AdminProfile.objects.create(user=user, role="editor", is_active=True)
        self.client.force_authenticate(user)
        response = self.client.get(PRICES_URL)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ids = {row["id"] for row in response.json()}
        self.assertTrue({self.published.id, self.unpublished.id} <= ids)
