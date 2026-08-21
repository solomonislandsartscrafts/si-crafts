"""
Tests proving the last-active-super-admin guard holds under concurrent requests.

These tests exercise the transaction-level locking in partial_update and destroy
to confirm that at least one sign-in-capable super admin survives even when two
requests race to demote/deactivate/delete the last remaining pair.

Uses TransactionTestCase so each thread sees committed writes, simulating real
concurrent HTTP requests. On SQLite, select_for_update is a no-op; the locking
constraint is enforced in production on Postgres.
"""

import threading
from concurrent.futures import ThreadPoolExecutor, as_completed

from django.contrib.auth.models import User
from django.test import TransactionTestCase, override_settings
from rest_framework.test import APIClient

from apps.accounts.models import AdminProfile


def _make_super_admin(email, password="TestPass1!"):
    """Create an active super admin with usable credentials."""
    user = User.objects.create_user(
        username=email, email=email, password=password, is_active=True
    )
    AdminProfile.objects.create(user=user, role="super_admin", is_active=True)
    return user


class LastSuperAdminConcurrencyTests(TransactionTestCase):
    """Concurrent demote/deactivate/delete must leave at least one super admin."""

    def _admin_client(self, user, password="TestPass1!"):
        client = APIClient()
        client.force_authenticate(user=user)
        return client

    def _active_super_admin_count(self):
        return AdminProfile.objects.filter(
            role="super_admin", is_active=True, user__is_active=True
        ).count()

    # --- demote ---

    def test_concurrent_demote_leaves_at_least_one(self):
        """Two threads demote the two remaining super admins simultaneously."""
        admin1 = _make_super_admin("admin1@test.invalid")
        admin2 = _make_super_admin("admin2@test.invalid")

        results = []
        barrier = threading.Barrier(2, timeout=5)

        def demote(actor, target):
            client = self._admin_client(actor)
            barrier.wait()
            resp = client.patch(
                f"/api/auth/users/{target.pk}/",
                {"role": "editor"},
                format="json",
            )
            results.append(resp.status_code)

        with ThreadPoolExecutor(max_workers=2) as pool:
            f1 = pool.submit(demote, admin1, admin2)
            f2 = pool.submit(demote, admin2, admin1)
            for f in as_completed([f1, f2]):
                f.result()

        # At least one request must be rejected (400) so one super admin stays.
        self.assertGreaterEqual(
            self._active_super_admin_count(),
            1,
            "No active super admin left after concurrent demotion.",
        )
        self.assertIn(400, results, "At least one demote should have been blocked.")

    # --- deactivate ---

    def test_concurrent_deactivate_leaves_at_least_one(self):
        """Two threads deactivate the two remaining super admins simultaneously."""
        admin1 = _make_super_admin("admin1@test.invalid")
        admin2 = _make_super_admin("admin2@test.invalid")

        results = []
        barrier = threading.Barrier(2, timeout=5)

        def deactivate(actor, target):
            client = self._admin_client(actor)
            barrier.wait()
            resp = client.patch(
                f"/api/auth/users/{target.pk}/",
                {"is_active": False},
                format="json",
            )
            results.append(resp.status_code)

        with ThreadPoolExecutor(max_workers=2) as pool:
            f1 = pool.submit(deactivate, admin1, admin2)
            f2 = pool.submit(deactivate, admin2, admin1)
            for f in as_completed([f1, f2]):
                f.result()

        self.assertGreaterEqual(
            self._active_super_admin_count(),
            1,
            "No active super admin left after concurrent deactivation.",
        )
        self.assertIn(400, results, "At least one deactivation should have been blocked.")

    # --- delete ---

    def test_concurrent_delete_leaves_at_least_one(self):
        """Two threads delete the two remaining super admins simultaneously."""
        admin1 = _make_super_admin("admin1@test.invalid")
        admin2 = _make_super_admin("admin2@test.invalid")

        results = []
        barrier = threading.Barrier(2, timeout=5)

        def delete(actor, target):
            client = self._admin_client(actor)
            barrier.wait()
            resp = client.delete(f"/api/auth/users/{target.pk}/")
            results.append(resp.status_code)

        with ThreadPoolExecutor(max_workers=2) as pool:
            f1 = pool.submit(delete, admin1, admin2)
            f2 = pool.submit(delete, admin2, admin1)
            for f in as_completed([f1, f2]):
                f.result()

        self.assertGreaterEqual(
            self._active_super_admin_count(),
            1,
            "No active super admin left after concurrent deletion.",
        )
        self.assertIn(400, results, "At least one delete should have been blocked.")
