#!/usr/bin/env bash
# Render build script for the Django/Wagtail backend.
set -o errexit

pip install --upgrade pip
pip install -r requirements.txt

python manage.py collectstatic --noinput
python manage.py migrate

# One-time: remove duplicate-email users, keeping the oldest one (remove after deploy)
python manage.py shell -c "
from django.contrib.auth.models import User
from django.db.models import Count
dupes = (
    User.objects.values('email')
    .annotate(c=Count('id'))
    .filter(c__gt=1)
    .exclude(email='')
)
for d in dupes:
    qs = User.objects.filter(email=d['email']).order_by('id')
    keep = qs.first()
    removed = qs.exclude(id=keep.id)
    print(f'Email {d[\"email\"]}: keeping user id={keep.id}, removing {removed.count()} duplicate(s)')
    removed.delete()
"

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
