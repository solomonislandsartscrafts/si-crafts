#!/usr/bin/env bash
#
# Replace the local sandbox database with a production snapshot.
#
# This only ever writes to the local SQLite sandbox file. It refuses to run if
# DATABASE_URL resolves to anything else, so it cannot overwrite Postgres or
# some other SQLite database it has no backup for.
#
# Accounts from the snapshot are sanitised after loading: password hashes are
# invalidated, personal emails/names/phones are replaced with sandbox
# placeholders, admin roles and logins are deactivated, live password-set tokens
# are deleted, and a local-only super admin is created instead. Content
# (products, makers, crafts) is loaded untouched.
#
# Usage:
#   ./scripts/seed-sandbox.sh                      # newest snapshot in snapshots/
#   ./scripts/seed-sandbox.sh snapshots/foo.json   # a specific snapshot
#   PROD_DATABASE_URL='postgres://...' ./scripts/seed-sandbox.sh   # fetch a fresh one
#
# Images are not copied. Production stores absolute R2 URLs, and that bucket is
# public, so the sandbox loads those images straight from R2 read-only. New
# uploads still go to backend/media/uploads because no R2 credentials are set
# locally, so the sandbox can never write to the production bucket.

set -euo pipefail

cd "$(dirname "$0")/.."

PYTHON=".venv/bin/python"
SNAPSHOT_DIR="snapshots"
SQLITE_FILE="db.sqlite3"

if [ ! -x "$PYTHON" ]; then
  echo "error: $PYTHON not found. Create the venv first." >&2
  exit 1
fi

# Guard: never let this touch a remote database.
TARGET_DB="${DATABASE_URL:-sqlite:///db.sqlite3}"
case "$TARGET_DB" in
  sqlite*) ;;
  *)
    echo "error: refusing to run. DATABASE_URL points at a non-SQLite database:" >&2
    echo "       $(printf '%s' "$TARGET_DB" | sed -E 's#//[^@]*@#//***@#')" >&2
    echo "       This script is destructive (it flushes the target) and is only" >&2
    echo "       ever meant to write to the local SQLite sandbox." >&2
    exit 1
    ;;
esac

# Guard: "some SQLite file" is not good enough. The pre-flush backup below only
# copies $SQLITE_FILE, so flushing any other SQLite database would be an
# unrecoverable wipe. Resolve the configured path and require it to be the
# sandbox database this script knows how to back up.
EXPECTED_DB="$PWD/$SQLITE_FILE"

# dj-database-url reads the URL path and drops one leading slash, so
# sqlite:///db.sqlite3 is relative and sqlite:////tmp/x.db is absolute.
TARGET_PATH="${TARGET_DB#sqlite://}"
TARGET_PATH="${TARGET_PATH#/}"
case "$TARGET_PATH" in
  /*) ;;
  *) TARGET_PATH="$PWD/$TARGET_PATH" ;;
esac

TARGET_DIR="$(cd "$(dirname "$TARGET_PATH")" 2>/dev/null && pwd || true)"
TARGET_CANON=""
if [ -n "$TARGET_DIR" ]; then
  TARGET_CANON="$TARGET_DIR/$(basename "$TARGET_PATH")"
fi

if [ "$TARGET_CANON" != "$EXPECTED_DB" ]; then
  echo "error: refusing to run. DATABASE_URL does not point at the sandbox database:" >&2
  echo "       $(printf '%s' "$TARGET_DB" | sed -E 's#//[^@]*@#//***@#')" >&2
  echo "       expected: $EXPECTED_DB" >&2
  echo "       This script is destructive (it flushes the target) and only backs" >&2
  echo "       up $SQLITE_FILE, so it will not flush any other file." >&2
  exit 1
fi

# Work out which snapshot to load.
SNAPSHOT="${1:-}"

if [ -z "$SNAPSHOT" ]; then
  if [ -n "${PROD_DATABASE_URL:-}" ]; then
    echo "No snapshot given and PROD_DATABASE_URL is set — taking a fresh one."
    ./scripts/backup-production.sh
  fi
  # Newest snapshot on disk, if any.
  SNAPSHOT="$(ls -t "$SNAPSHOT_DIR"/*.json 2>/dev/null | head -1 || true)"
fi

if [ -z "$SNAPSHOT" ] || [ ! -f "$SNAPSHOT" ]; then
  cat >&2 <<'EOF'
error: no snapshot to load.

Either take one from production:

  PROD_DATABASE_URL='postgres://...' ./scripts/seed-sandbox.sh

or pass an existing file:

  ./scripts/seed-sandbox.sh snapshots/production-20260820-120000.json

EOF
  exit 1
fi

echo "Loading snapshot: $SNAPSHOT"

# Keep a copy of the current sandbox so a failed load is recoverable.
if [ -f "$SQLITE_FILE" ]; then
  BACKUP="${SQLITE_FILE}.bak-$(date +%Y%m%d-%H%M%S)"
  cp "$SQLITE_FILE" "$BACKUP"
  echo "Previous sandbox saved to $BACKUP"
fi

"$PYTHON" manage.py migrate --noinput

# flush empties the tables but keeps the schema. This wipes any local superuser.
# A sandbox-only admin is recreated by the sanitise step below — production
# credentials are deliberately not usable here.
"$PYTHON" manage.py flush --noinput

"$PYTHON" manage.py loaddata "$SNAPSHOT"

# The snapshot carries real accounts: password hashes, personal email addresses,
# contact names and phone numbers, plus any live password-set tokens. None of
# that should be usable from a laptop, so scrub it before the sandbox is used.
# Content (products, makers, crafts) is untouched — that is the point of seeding.
SANDBOX_ADMIN_EMAIL="${SANDBOX_ADMIN_EMAIL:-sandbox@localhost.invalid}"
SANDBOX_ADMIN_PASSWORD="${SANDBOX_ADMIN_PASSWORD:-sandbox-admin}"

SANDBOX_ADMIN_EMAIL="$SANDBOX_ADMIN_EMAIL" \
SANDBOX_ADMIN_PASSWORD="$SANDBOX_ADMIN_PASSWORD" \
"$PYTHON" manage.py shell <<'PY'
import os

from django.contrib.auth.models import User

from apps.accounts.models import AdminProfile
from apps.stockists.models import PasswordSetToken, Stockist

admin_email = os.environ["SANDBOX_ADMIN_EMAIL"]
admin_password = os.environ["SANDBOX_ADMIN_PASSWORD"]

# 1. No production password is usable locally, and no production address can be
#    reached by anything the sandbox sends.
for user in User.objects.all():
    user.set_unusable_password()
    user.username = f"sandbox-user-{user.pk}"
    user.email = f"user{user.pk}@sandbox.invalid"
    user.first_name = "Sandbox"
    user.last_name = f"User {user.pk}"
    # Nobody keeps elevated rights by accident.
    user.is_staff = False
    user.is_superuser = False
    user.is_active = False
    user.save()

# 2. Admin dashboard access is revoked; re-grant locally if a role is needed.
AdminProfile.objects.update(is_active=False, failed_login_attempts=0, locked_until=None)

# 3. Stockist records keep their business shape but lose the personal details.
for stockist in Stockist.objects.all():
    stockist.email = f"stockist{stockist.pk}@sandbox.invalid"
    stockist.contact_name = f"Sandbox Contact {stockist.pk}"
    stockist.phone = ""
    stockist.abn = ""
    stockist.save(update_fields=["email", "contact_name", "phone", "abn"])

# 4. Any password link copied from production would still be live.
PasswordSetToken.objects.all().delete()

# 5. One local-only super admin so the dashboard is reachable.
User.objects.filter(username="sandbox-admin").delete()
sandbox_admin = User.objects.create_superuser(
    username="sandbox-admin",
    email=admin_email,
    password=admin_password,
)
AdminProfile.objects.update_or_create(
    user=sandbox_admin,
    defaults={
        "role": "super_admin",
        "is_active": True,
        "failed_login_attempts": 0,
        "locked_until": None,
    },
)

print(f"  sanitised {User.objects.exclude(pk=sandbox_admin.pk).count()} imported account(s)")
print(f"  sandbox admin: {admin_email}")
PY

# Rebuild the search index, which was deliberately left out of the snapshot.
"$PYTHON" manage.py update_index || echo "note: update_index skipped"

echo
echo "Sandbox seeded. Row counts:"
"$PYTHON" manage.py shell -c "
from apps.products.models import ProductPage
from apps.makers.models import MakerPage
from apps.crafts.models import CraftPage
for label, model in (('products', ProductPage), ('makers', MakerPage), ('crafts', CraftPage)):
    print(f'  {label}: {model.objects.count()}')
"

echo
echo "Accounts were sanitised. Production logins do not work here."
echo "Sign in to the sandbox admin with:"
echo "  email:    $SANDBOX_ADMIN_EMAIL"
echo "  password: $SANDBOX_ADMIN_PASSWORD"
echo "Override with SANDBOX_ADMIN_EMAIL / SANDBOX_ADMIN_PASSWORD."

echo
echo "Start the sandbox with:"
echo "  npm run sandbox:backend    # terminal 1"
echo "  npm run dev:sandbox        # terminal 2"
