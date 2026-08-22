from django.db import migrations


# The organisation is "Solomon Islands Arts & Crafts". A large amount of copy
# had been written without the ampersand, and the frontend defaults have now
# been corrected — but defaults only apply to rows that are blank or absent.
# Anything already sitting in the database keeps the old wording, which on the
# public site means the FAQ answers (seeded by faqs.0002) and any page copy an
# admin has saved through the Site Text or Site Content admin.
#
# This migration rewrites those stored rows. It is a plain phrase replacement,
# so it is safe to run more than once: after the first pass there is nothing
# left to match.
OLD = "Solomon Islands Arts Crafts"
NEW = "Solomon Islands Arts & Crafts"

# Every human-readable field on the SiteContent singleton, including image alt
# text, which is copy an admin writes and can name the organisation.
#
# Deliberately excluded: the *_image_url and *_link_url fields (rewriting a URL
# would break the link), contact_email (an address cannot contain the spaced
# phrase), and slideshow_settings (JSON holding ids and crop positions).
SITE_CONTENT_FIELDS = [
    "about_solomon_islands_image_alt",
    "about_team_image_alt",
    "why_we_do_this_image_alt",
    "homepage_heading",
    "homepage_intro",
    "homepage_cta_text",
    "homepage_makers_heading",
    "homepage_makers_intro",
    "about_page_intro",
    "about_solomon_islands_heading",
    "about_solomon_islands_text",
    "about_solomon_islands_link_text",
    "about_team_heading",
    "about_team_text",
    "about_team_link_text",
    "about_why_heading",
    "about_why_text",
    "about_why_link_text",
    "wholesale_intro",
    "wholesale_how_it_works",
    "wholesale_minimum_order",
    "care_guide_intro",
    "care_guide_pandanus",
    "care_guide_wood",
    "care_guide_shell",
    "contact_intro",
    "contact_response_time",
]


def _swap(apps, old, new):
    """Replace `old` with `new` across every stored copy field."""
    SiteText = apps.get_model("site_text", "SiteText")
    for row in SiteText.objects.filter(value__contains=old):
        row.value = row.value.replace(old, new)
        row.save(update_fields=["value"])

    Faq = apps.get_model("faqs", "Faq")
    for faq in Faq.objects.all():
        changed = False
        for field in ("question", "answer"):
            current = getattr(faq, field)
            if old in current:
                setattr(faq, field, current.replace(old, new))
                changed = True
        if changed:
            faq.save(update_fields=["question", "answer"])

    SiteContent = apps.get_model("site_content", "SiteContent")
    for content in SiteContent.objects.all():
        changed = []
        for field in SITE_CONTENT_FIELDS:
            # Guard with hasattr: this list is a snapshot of the model as it
            # stands today, and a later migration may rename or drop a field.
            if not hasattr(content, field):
                continue
            current = getattr(content, field) or ""
            if old in current:
                setattr(content, field, current.replace(old, new))
                changed.append(field)
        if changed:
            content.save(update_fields=changed)


def restore_ampersand(apps, schema_editor):
    _swap(apps, OLD, NEW)


# Reverse is a no-op on purpose. Stripping the ampersand back out would rewrite
# whatever an admin has since written through the Site Text or Site Content
# admin — including copy that legitimately contains the corrected name — so a
# rollback of this migration must leave editable content alone.


class Migration(migrations.Migration):

    dependencies = [
        ("site_text", "0001_initial"),
        ("faqs", "0002_seed_faqs"),
        ("site_content", "0007_add_slideshow_settings"),
    ]

    operations = [
        migrations.RunPython(restore_ampersand, migrations.RunPython.noop),
    ]
