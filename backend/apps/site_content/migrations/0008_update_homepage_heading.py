from django.db import migrations


# The hero eyebrow (stored as `homepage_heading`) used to default to
# "Meet the Makers Behind Every Piece", which said almost exactly what the
# "Meet the makers" section heading one screen below already says. The frontend
# fallback has since been changed to "Wholesale Solomon Islands handicrafts" so
# the hero leads with what the business IS — but a fallback only applies to a
# blank column, and production has the old wording persisted in the
# SiteContent singleton, which wins over the fallback and keeps the old line on
# the live page.
#
# This migration rewrites that one stored value. It is targeted at the exact
# stale string only, so it does NOT clobber a heading an admin has since set
# deliberately — anything other than the old default is left alone. Safe to run
# more than once: after the first pass there is nothing left to match.
OLD = "Meet the Makers Behind Every Piece"
NEW = "Wholesale Solomon Islands handicrafts"


def set_homepage_heading(apps, schema_editor):
    SiteContent = apps.get_model("site_content", "SiteContent")
    for content in SiteContent.objects.all():
        if getattr(content, "homepage_heading", "") == OLD:
            content.homepage_heading = NEW
            content.save(update_fields=["homepage_heading"])


# Reverse is a no-op: restoring the superseded wording would undo an
# intentional copy fix, and a value an admin has since edited must be left as-is.


class Migration(migrations.Migration):

    dependencies = [
        ("site_content", "0007_add_slideshow_settings"),
    ]

    operations = [
        migrations.RunPython(set_homepage_heading, migrations.RunPython.noop),
    ]
