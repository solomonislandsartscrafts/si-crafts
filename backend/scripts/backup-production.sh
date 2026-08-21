#!/usr/bin/env bash
#
# Snapshot the production database to a JSON file.
#
# Why this exists:
# The production database is on Render's free plan, which is capped at 1 GB and
# expires 30 days after creation (then a 14-day grace period before the data is
# deleted). Nothing on it is permanent, so take snapshots.
#
# Why dumpdata rather than pg_dump:
# dumpdata goes through the Django ORM, so it does not care what major version
# the server runs. pg_dump refuses to talk to a server newer than itself, and the
# pg_dump on this machine is v14 while Render runs something newer.
#
# Usage:
#   PROD_DATABASE_URL='postgres://user:pass@host/db' ./scripts/backup-production.sh [outfile]
#
# The output may contain real stockist names, emails and password hashes, so it is
# written into backend/snapshots/ which is gitignored. Keep it off shared drives.

set -euo pipefail

# The snapshot carries real stockist names, emails and password hashes, so
# everything this script creates is owner-only from the moment it exists.
umask 077

cd "$(dirname "$0")/.."

PYTHON=".venv/bin/python"
SNAPSHOT_DIR="snapshots"

if [ ! -x "$PYTHON" ]; then
  echo "error: $PYTHON not found. Create the venv first." >&2
  exit 1
fi

if [ -z "${PROD_DATABASE_URL:-}" ]; then
  cat >&2 <<'EOF'
error: PROD_DATABASE_URL is not set.

Copy the External Database URL from the Render dashboard
(siac-db -> Connect -> External Connection) and run:

  PROD_DATABASE_URL='postgres://...' ./scripts/backup-production.sh

EOF
  exit 1
fi

mkdir -p "$SNAPSHOT_DIR"
OUTFILE="${1:-$SNAPSHOT_DIR/production-$(date +%Y%m%d-%H%M%S).json}"

# Print the host only. The URL holds credentials, so never echo it whole.
SAFE_HOST="$(printf '%s' "$PROD_DATABASE_URL" | sed -E 's#^.*@##; s#/.*$##')"
echo "Snapshotting database at ${SAFE_HOST}"

# Render requires TLS for external Postgres connections. Ask for it in the URL
# rather than via DEBUG=False: settings.py derives ssl_require from DEBUG, which
# would also push sslmode onto non-Postgres URLs and break them.
DUMP_DATABASE_URL="$PROD_DATABASE_URL"
case "$DUMP_DATABASE_URL" in
  postgres://*|postgresql://*)
    if ! printf '%s' "$DUMP_DATABASE_URL" | grep -q 'sslmode='; then
      case "$DUMP_DATABASE_URL" in
        *\?*) DUMP_DATABASE_URL="${DUMP_DATABASE_URL}&sslmode=require" ;;
        *)    DUMP_DATABASE_URL="${DUMP_DATABASE_URL}?sslmode=require" ;;
      esac
    fi
    ;;
esac

# Excluded tables:
#   contenttypes, auth.permission  rebuilt by migrate; including them causes
#                                  primary-key clashes on load
#   sessions, token_blacklist      throwaway auth state, often large
#   admin.logentry, *logentry      audit noise that points at contenttypes.
#                                  Safe to drop because nothing references log
#                                  entries; they are leaves.
#   wagtailsearch                  rebuildable index. Excluded at APP level
#                                  because SQLiteFTSIndexEntry exists only on
#                                  SQLite, so naming it directly would break
#                                  when dumping from Postgres
#
# wagtailcore.revision is deliberately NOT excluded. It looks like an easy win
# because it holds every historical page edit, but wagtailcore_page rows carry
# latest_revision_id and live_revision_id FKs into it, so dropping it makes
# loaddata fail with an invalid-foreign-key IntegrityError.
#
# --natural-foreign lets FKs to contenttypes/users resolve by name on load,
# which is what makes excluding contenttypes safe. Page primary keys are left
# intact because Wagtail's treebeard paths depend on them.
DATABASE_URL="$DUMP_DATABASE_URL" "$PYTHON" manage.py dumpdata \
  --natural-foreign \
  --indent 2 \
  --exclude contenttypes \
  --exclude auth.permission \
  --exclude sessions \
  --exclude admin.logentry \
  --exclude token_blacklist \
  --exclude wagtailsearch \
  --exclude wagtailcore.pagelogentry \
  --exclude wagtailcore.modellogentry \
  --output "$OUTFILE"

# umask covers files this script creates, but a caller-supplied [outfile] may
# already exist with looser permissions. Restrict it either way.
chmod 600 "$OUTFILE"

SIZE="$(du -h "$OUTFILE" | cut -f1 | tr -d ' ')"
echo "Wrote $OUTFILE ($SIZE)"
echo "Load it into the local sandbox with: ./scripts/seed-sandbox.sh"
