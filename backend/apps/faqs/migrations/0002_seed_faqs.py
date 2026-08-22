from django.db import migrations


# The FAQs that were previously hardcoded in the Next.js page. Seeded here so
# the database is the source of truth from the first deploy and admins have
# something to edit rather than an empty screen.
SEED_FAQS = [
    (
        "How does wholesale ordering work?",
        "Browse our catalogue, build an order, and submit it as an expression of interest. "
        "We confirm availability, send an invoice, and ship once payment is received by bank "
        "transfer. There are no minimum order quantities, but we encourage orders of at least "
        "6 pieces for shipping efficiency.",
    ),
    (
        "How long does delivery take?",
        "We ship from Sydney within 3\u20135 business days of receiving payment. Delivery within "
        "Australia is typically 2\u20135 business days depending on your location. Within Australia, "
        "we use tracked shipping on all orders. In 2026 when we started this small business, we "
        "made one shopping trip to purchase orders directly from the makers in Solomon Islands. "
        "We intend to do this each year while also exploring a reliable and cost-effective "
        "freight and customs service between Honiara and Australia.",
    ),
    (
        "What is your returns policy?",
        "Because each piece is handmade, no two are identical. We accept returns for damage in "
        "transit within 7 days of delivery \u2014 contact us with photos of the damage and we will "
        "arrange a replacement or refund. We cannot accept returns for change of mind on "
        "handmade goods.",
    ),
    (
        "Can I return unsold goods?",
        "No \u2014 orders are purchased outright at wholesale prices.",
    ),
    (
        "Do you sell to the public?",
        "No \u2014 Solomon Islands Arts & Crafts is wholesale-only. We do not sell individual pieces "
        "to the public. If you are a retail customer, please visit one of our stocking retailers "
        "(check the \u201cWhere to buy\u201d section on any product\u2019s provenance page) to purchase a "
        "piece in person or by using that shop\u2019s online ordering service.",
    ),
    (
        "Can I order custom or bulk items?",
        "Yes \u2014 we can arrange customised pieces (e.g. a gallery or person\u2019s name woven into a "
        "bag border) and bulk orders for exhibitions or events. Lead times are longer as makers "
        "produce to order. Log in to your stockist account and submit a request under "
        "\u201cRequests\u201d, or contact us to discuss.",
    ),
    (
        "How do I get a replacement tag if mine fell off?",
        "Log in to your stockist account and go to \u201cRequests\u201d \u2192 \u201cReplacement Tags\u201d. Enter the "
        "product code and quantity needed. We\u2019ll post new tags to you at no charge.",
    ),
    (
        "Why do you sell only through museum and gallery shops?",
        "We are a small volunteer team. Selling wholesale means we can sell more pieces with "
        "fewer transactions, keep admin low, and focus our time on relationships with makers and "
        "stockists. Museum and gallery shops also provide an environment where authenticity, art "
        "and storytelling are valued \u2014 which respects the work and the makers behind it.",
    ),
    (
        "Are the items really made in Solomon Islands?",
        "Yes \u2014 every piece is handmade by a named maker in their community. Each product tag "
        "carries a code that links to a provenance page showing who made it, where, and how. We "
        "buy directly from makers; there is no third-party factory or intermediary supply chain.",
    ),
    (
        "How much of the price goes back to the maker?",
        "Makers set their own prices and are paid upfront when we purchase the work \u2014 before it "
        "reaches Australia. SIAC\u2019s margin covers international freight, documentation, liaising "
        "with the makers and distribution. No one at SIAC draws a salary from craft sales. See "
        "the Our Promise page for more detail.",
    ),
    (
        "How do I become a stockist?",
        "Submit an application through our Wholesale page with your business details and ABN. We "
        "review applications within a few business days and will be in touch once approved.",
    ),
    (
        "What about GST?",
        "Our wholesale prices are quoted exclusive of GST. Whether you need to register for and "
        "charge GST depends on your actual or projected annual GST turnover \u2014 generally "
        "AUD$75,000 for businesses or AUD$150,000 for non-profit organisations. Please consult "
        "your accountant for advice specific to your business.",
    ),
    (
        "I\u2019m a maker in Solomon Islands \u2014 how can I sell my arts and crafts through SIAC?",
        "Fantastic! We\u2019d love to hear from you. Read the information on the \u201cFor Makers\u201d page "
        "and use the contact form to tell us about the things you make. We will try and reply "
        "within a few days.",
    ),
]


def seed_faqs(apps, schema_editor):
    Faq = apps.get_model("faqs", "Faq")
    # Only seed an empty table so re-running against a populated database
    # (or after an admin has curated the list) is a no-op.
    if Faq.objects.exists():
        return
    Faq.objects.bulk_create(
        [
            Faq(question=question, answer=answer, sort_order=index)
            for index, (question, answer) in enumerate(SEED_FAQS, start=1)
        ]
    )


class Migration(migrations.Migration):

    dependencies = [
        ("faqs", "0001_initial"),
    ]

    operations = [
        migrations.RunPython(seed_faqs, migrations.RunPython.noop),
    ]
