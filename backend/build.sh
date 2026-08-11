#!/usr/bin/env bash
# Render build script for the Django/Wagtail backend.
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Create superuser if none exists (uses env vars DJANGO_SUPERUSER_*)
if [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
  python manage.py createsuperuser --noinput || true
fi

# One-time: reset admin password from dump (remove after deploy)
if [ -f user_dump.json ]; then
  echo "==> Loading user data..."
  python manage.py loaddata user_dump.json
  echo "==> User data loaded."
fi
