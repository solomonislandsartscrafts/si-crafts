from django.db import migrations


# Baseline team members. These mirror the front-end DEFAULT_TEAM seed so the
# public site and the admin dashboard start from the same content. Once seeded,
# they are ordinary rows: the admin can edit them and those edits persist in the
# database (the source of truth), rather than only in one browser's localStorage.
SEED_MEMBERS = [
    {
        "name": "Alison Wishart",
        "location": "Sydney, Australia",
        "bio": (
            "Alison lives in Sydney, Australia and was born near Munda in "
            "Western Province. In 2025, she went to Honiara with the Australian "
            "Volunteers Program and worked with makers and artisans at the "
            "Solomon Islands National Art Gallery for six months. She is "
            "responsible for importing, documentation, liaising with makers and "
            "stockists, and day-to-day operations. Alison is the founder and "
            "director of SIAC."
        ),
        "photo_url": "",
        "photo_alt": "Alison Wishart",
        "photo_position": "",
        "sort_order": 1,
    },
    {
        "name": "Isaac Tekulu",
        "location": "Dunedin, New Zealand",
        "bio": (
            "Isaac was born in Solomon Islands and now lives in Dunedin with his "
            "young family. He designed and maintains the website, is the graphic "
            "designer and web developer for SIAC. He handles the brand identity, "
            "website, and digital presence — ensuring the crafts and maker's "
            "stories are presented with the respect they deserve."
        ),
        "photo_url": "",
        "photo_alt": "Isaac Tekulu",
        "photo_position": "",
        "sort_order": 2,
    },
    {
        "name": "Jade Scott",
        "location": "Sydney, Australia",
        "bio": (
            "Jade is a freelance graphic designer based in Sydney and designed "
            "the brand identity and logo."
        ),
        "photo_url": "",
        "photo_alt": "Jade Scott",
        "photo_position": "",
        "sort_order": 3,
    },
]


def seed_team(apps, schema_editor):
    """Seed baseline team members, but only if the table is empty.

    Idempotent and non-destructive: if any team member already exists (e.g. the
    admin has already created rows, or this ran on a previous deploy), it does
    nothing, so real admin edits are never overwritten.
    """
    TeamMember = apps.get_model("team", "TeamMember")
    if TeamMember.objects.exists():
        return
    TeamMember.objects.bulk_create(
        [TeamMember(**member) for member in SEED_MEMBERS]
    )


def unseed_team(apps, schema_editor):
    """Reverse: remove only the seeded rows, matched by name."""
    TeamMember = apps.get_model("team", "TeamMember")
    names = [member["name"] for member in SEED_MEMBERS]
    TeamMember.objects.filter(name__in=names).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("team", "0002_teammember_photo_position"),
    ]

    operations = [
        migrations.RunPython(seed_team, unseed_team),
    ]
