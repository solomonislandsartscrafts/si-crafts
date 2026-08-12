#!/usr/bin/env bash
# Render build script for the Django/Wagtail backend.
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# Create superuser if none exists (uses env vars DJANGO_SUPERUSER_*).
# Skip if a user with that email already exists to avoid duplicate-email users.
if [ -n "$DJANGO_SUPERUSER_EMAIL" ]; then
  python manage.py shell -c "
from django.contrib.auth.models import User
import os
email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
if email and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(
        username=os.environ.get('DJANGO_SUPERUSER_USERNAME', 'admin'),
        email=email,
        password=os.environ.get('DJANGO_SUPERUSER_PASSWORD'),
    )
    print('Superuser created.')
else:
    print('Superuser email already exists, skipping.')
"
fi
