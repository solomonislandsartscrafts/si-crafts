from django.db import migrations


# The two shops that were previously hardcoded in the frontend mock data.
# Seeded so the Stockists page keeps working the moment this ships, and so
# admins have real records to edit rather than an empty directory.
SEED_STOCKISTS = [
    {
        "city": "Brisbane",
        "name": "QAGOMA Queensland Art Gallery of Modern Art",
        "url": "https://qagoma.store/",
        "address": "Stanley Place, South Brisbane Queensland 4101, Australia",
        "phone": "+61 (0)7 3840 7290",
        "email": "qagomastore@qagoma.qld.gov.au",
        "hours": "Open Daily 10am\u20135pm",
        "closed": "Closed Good Friday, Christmas Day, Boxing Day",
    },
    {
        "city": "Sydney",
        "name": "Australian Museum",
        "url": "https://australian.museum/visit/shop/",
        "address": "1 William Street Sydney NSW 2010, Australia",
        "phone": "+61 (0)2 9320 6150",
        "email": "shop@australian.museum",
        "hours": "Open Daily 10am\u20135pm",
        "closed": "Closed Christmas Day",
    },
]


def seed(apps, schema_editor):
    RetailStockist = apps.get_model("retail_stockists", "RetailStockist")
    if RetailStockist.objects.exists():
        return
    RetailStockist.objects.bulk_create(
        [
            RetailStockist(sort_order=index, **fields)
            for index, fields in enumerate(SEED_STOCKISTS, start=1)
        ]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("retail_stockists", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed, migrations.RunPython.noop),
    ]
