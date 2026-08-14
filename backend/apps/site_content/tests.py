from django.test import TestCase
from rest_framework.test import APIClient
from rest_framework import status
from django.contrib.auth import get_user_model

from .models import SiteContent

User = get_user_model()


class SiteContentMaxLengthValidationTest(TestCase):
    """Test that CharField max_length is enforced at the serializer level."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username="admin_test",
            password="testpass123",
            is_staff=True,
        )
        self.client.force_authenticate(user=self.user)
        # Ensure the singleton exists
        SiteContent.load()

    def test_homepage_heading_over_max_length_returns_400(self):
        """Submitting homepage_heading exceeding 200 chars should return HTTP 400."""
        over_limit_value = "x" * 201
        response = self.client.put(
            "/api/site-content/",
            data={"homepageHeading": over_limit_value},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("homepage_heading", response.data)
