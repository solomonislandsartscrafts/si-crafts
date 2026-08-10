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

# One-time data import from local SQLite dump (remove after successful deploy)
if [ -f data_dump.json ]; then
  echo "==> Loading data from data_dump.json..."
  python manage.py loaddata data_dump.json
  echo "==> Data loaded successfully!"
fi
