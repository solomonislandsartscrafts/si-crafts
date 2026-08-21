"""
Point local content at the real production images.

Why this exists
---------------
The local SQLite database is a stale sandbox seed. Its image fields had the same
pan-pipe photograph repeated across six slots and one weaver portrait shared by
two makers, because only three distinct pictures were ever uploaded locally.
Production, meanwhile, has the correct distinct photograph for every record,
stored in R2.

The full fix is `scripts/sync-prod-to-local.sh`, which copies the whole
production database. That needs PROD_DATABASE_URL (the Render Postgres
credential). This script is the narrow alternative: it reads the *public* REST
API, which needs no credential, and copies only the image URL and alt fields
onto the matching local records.

Absolute R2 URLs are passed through untouched by resolveImageUrl(), and
`*.r2.dev` is already allow-listed in next.config.ts, so the images load in
local dev without any further configuration.

Scope limit
-----------
This only updates records that already exist locally. Production has content
that the local seed never had (a fifth product, a third maker, two real
articles); creating those needs the full database sync above. Anything missing
is listed at the end.

Run with:
    .venv/bin/python manage.py shell < scripts/sync_images_from_production.py
"""

import json
import os
import urllib.request

from apps.articles.models import ArticlePage
from apps.makers.models import MakerPage
from apps.products.models import ProductPage
from apps.site_content.models import SiteContent

API = os.environ.get("PROD_API_URL", "https://si-crafts-iwcd.onrender.com").rstrip("/")
TIMEOUT = 120  # Render's free tier sleeps; a cold start can take ~40s.

updated = []
missing = []


def fetch(path):
    with urllib.request.urlopen(API + path, timeout=TIMEOUT) as r:
        return json.loads(r.read().decode())


def apply_fields(obj, mapping, label):
    """Copy mapping {local_field: new_value} onto obj, recording real changes."""
    changed = False
    for field, new in mapping.items():
        old = getattr(obj, field)
        # Compare JSON-ish values structurally; skip when production has nothing.
        if new in (None, "", []) or old == new:
            continue
        updated.append((label, field, old, new))
        setattr(obj, field, new)
        changed = True
    return changed


# --- Products (matched on product_code) -----------------------------------
local_products = {p.product_code: p for p in ProductPage.objects.all()}
for item in fetch("/api/v2/products/?limit=100&fields=product_code,image_urls,image_alts")["items"]:
    code = item["product_code"]
    product = local_products.get(code)
    if product is None:
        missing.append(f"product {code} ({item['title']})")
        continue
    if apply_fields(
        product,
        {"image_urls": item.get("image_urls") or [], "image_alts": item.get("image_alts") or []},
        f"product {code}",
    ):
        product.save()
        product.save_revision().publish()

# --- Makers (matched on page title, i.e. the maker's name) ----------------
local_makers = {m.title: m for m in MakerPage.objects.all()}
for item in fetch("/api/v2/makers/?limit=100&fields=title,portrait_url,portrait_alt")["items"]:
    maker = local_makers.get(item["title"])
    if maker is None:
        missing.append(f"maker {item['title']}")
        continue
    if apply_fields(
        maker,
        {"portrait_url": item.get("portrait_url") or "", "portrait_alt": item.get("portrait_alt") or ""},
        f"maker {item['title']}",
    ):
        maker.save()
        maker.save_revision().publish()

# --- Articles (matched on page title) -------------------------------------
local_articles = {a.title: a for a in ArticlePage.objects.all()}
for item in fetch("/api/v2/articles/?limit=100&fields=title,cover_image_url,cover_image_alt")["items"]:
    article = local_articles.get(item["title"])
    if article is None:
        missing.append(f"article {item['title']}")
        continue
    if apply_fields(
        article,
        {
            "cover_image_url": item.get("cover_image_url") or "",
            "cover_image_alt": item.get("cover_image_alt") or "",
        },
        f"article {item['title']}",
    ):
        article.save()
        article.save_revision().publish()

# --- Site content (single row; the API serialises it camelCase) ------------
SITE_FIELDS = {
    "about_solomon_islands_image_url": "aboutSolomonIslandsImage",
    "about_solomon_islands_image_alt": "aboutSolomonIslandsImageAlt",
    "about_team_image_url": "aboutTeamImage",
    "about_team_image_alt": "aboutTeamImageAlt",
    "why_we_do_this_image_url": "whyWeDoThisImage",
    "why_we_do_this_image_alt": "whyWeDoThisImageAlt",
}
site = SiteContent.objects.first()
if site:
    payload = fetch("/api/site-content/")
    if apply_fields(
        site,
        {local: payload.get(remote) or "" for local, remote in SITE_FIELDS.items()},
        "site content",
    ):
        site.save()

# --- Report ---------------------------------------------------------------
print(f"\n{len(updated)} field(s) updated from {API}\n")
for label, field, old, new in updated:
    print(f"  {label}  .{field}")
    print(f"      was: {old or '(empty)'}")
    print(f"      now: {new}")

if missing:
    print(f"\n{len(missing)} record(s) exist in production but not locally:")
    for m in missing:
        print(f"  - {m}")
    print("\n  Run scripts/sync-prod-to-local.sh (needs PROD_DATABASE_URL) to pull these in.")
