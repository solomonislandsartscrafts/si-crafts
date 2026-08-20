#!/usr/bin/env bash
#
# Copy PRODUCTION content into the LOCAL SQLite database.
#
# Why this exists:
# Local, preview and production all talk to the same Render backend and database,
# so editing content or uploading an image locally changes production. Run this
# script, point the frontend at a local backend (see LOCAL-DEV.md), and you get a
# private copy of production content that you can break freely.
#
# Usage:
#   export PROD_DATABASE_URL='postgresql://...'   # Render -> siac-db -> External Database URL
#   ./scripts/sync-prod-to-local.sh
#
# The snapshot it writes (backend/prod-snapshot.json) contains user password
# hashes, so it is gitignored. Delete it when you are done if you prefer.
#
set -euo pipefail

BACKEND="$(cd "$(dirname "${BASH_SOURCE[0]}")/../backend" && pwd)"
PY="$BACKEND/.venv/bin/python"
SNAPSHOT="$BACKEND/prod-snapshot.json"

if [[ -z "${PROD_DATABASE_URL:-}" ]]; then
  echo "PROD_DATABASE_URL is not set." >&2
  echo "Get it from Render -> siac-db -> 'External Database URL', then run:" >&2
  echo "  export PROD_DATABASE_URL='postgresql://...'" >&2
  exit 1
fi

if [[ ! -x "$PY" ]]; then
  echo "Python venv missing. Create it with:" >&2
  echo "  python3 -m venv backend/.venv" >&2
  echo "  backend/.venv/bin/pip install -r backend/requirements.txt" >&2
  exit 1
fi

cd "$BACKEND"

# Excluded from the copy: contenttypes and permissions are recreated by migrate,
# and copying them clashes on primary keys. Sessions and log entries are noise.
# If loaddata later fails on some model, add "--exclude app.model" here.
EXCLUDES=(
  --exclude contenttypes
  --exclude auth.permission
  --exclude sessions
  --exclude admin.logentry
  --exclude wagtailcore.pagelogentry
  --exclude wagtailcore.revision
)

echo "==> Dumping production content"
# DEBUG=False so settings.py sets ssl_require=True, which Render's Postgres needs.
DATABASE_URL="$PROD_DATABASE_URL" DEBUG=False \
  "$PY" manage.py dumpdata "${EXCLUDES[@]}" \
    --natural-foreign --natural-primary --indent 2 --output "$SNAPSHOT"

if [[ -f db.sqlite3 ]]; then
  BACKUP="db.sqlite3.bak-$(date +%Y%m%d-%H%M%S)"
  echo "==> Backing up current local database to $BACKUP"
  cp db.sqlite3 "$BACKUP"
fi

echo "==> Rebuilding local SQLite schema"
rm -f db.sqlite3
# Unset so settings.py falls back to its local SQLite default, even if the caller
# has DATABASE_URL exported in their shell.
unset DATABASE_URL
"$PY" manage.py migrate --noinput

echo "==> Loading production content into local SQLite"
"$PY" manage.py loaddata "$SNAPSHOT"

echo
echo "Done. The local database now mirrors production."
echo "Start the backend with:"
echo "  cd backend && .venv/bin/python manage.py runserver"
