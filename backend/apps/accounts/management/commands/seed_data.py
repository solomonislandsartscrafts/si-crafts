"""
Management command to seed the database with sample data.
Based on the original mock data from the SI Crafts project.

Usage:
    python3 manage.py seed_data
"""
from django.core.management.base import BaseCommand
from wagtail.models import Page, Site

from apps.categories.models import MaterialCategory, ProductType
from apps.crafts.models import CraftPage
from apps.makers.models import MakerPage
from apps.products.models import ProductPage


class Command(BaseCommand):
    help = "Seed the database with sample categories, crafts, makers, and products"

    def handle(self, *args, **options):
        self.stdout.write("Seeding database...")

        # --- Step 1: Material Categories ---
        categories_data = [
            {"value": "pandanus", "label": "Pandanus", "code_initial": "P"},
            {"value": "wood", "label": "Wood", "code_initial": "W"},
            {"value": "shells", "label": "Shells", "code_initial": "S"},
            {"value": "bush-twine", "label": "Bush-twine", "code_initial": "B"},
        ]
        for cat in categories_data:
            MaterialCategory.objects.get_or_create(
                value=cat["value"],
                defaults={"label": cat["label"], "code_initial": cat["code_initial"]},
            )
        self.stdout.write(self.style.SUCCESS(f"  ✓ {MaterialCategory.objects.count()} material categories"))

        # --- Step 2: Product Types ---
        types_data = [
            "Bags", "Purses", "Jewellery", "Trays", "Fans",
            "Bowls", "Ornaments", "Carvings", "Baskets", "Brooches", "Kits",
        ]
        for t in types_data:
            ProductType.objects.get_or_create(
                value=t.lower(),
                defaults={"label": t},
            )
        self.stdout.write(self.style.SUCCESS(f"  ✓ {ProductType.objects.count()} product types"))

        # --- Step 3: Get or create root page for content ---
        root_page = Page.objects.filter(depth=1).first()
        home_page = root_page.get_children().filter(title="Welcome to your new Wagtail site!").first()
        if not home_page:
            home_page = root_page.get_children().first()

        # Create parent pages for each content type
        crafts_index = self._get_or_create_child(home_page or root_page, "Crafts")
        makers_index = self._get_or_create_child(home_page or root_page, "Makers")
        products_index = self._get_or_create_child(home_page or root_page, "Products")

        # --- Step 4: Crafts ---
        craft_pandanus = self._create_craft(crafts_index, {
            "title": "Pandanus Weaving",
            "slug": "pandanus-weaving",
            "description": "Traditionally in Melanesian culture, men learn to carve and women learn to weave. For some women, particularly those from Rennell and Bellona Province, weaving is a way of life and a part of their identity. Most bags and mats are made from the leaves of the pandanus tree.",
            "material_category": "pandanus",
            "cultural_context": "In many Solomon Islands communities, weaving knowledge is passed from mother to daughter. Specific patterns may belong to particular families or clans and carry stories of origin, place, and kinship.",
            "cultural_context_review_flag": "reviewed",
        })

        craft_wood = self._create_craft(crafts_index, {
            "title": "Wood Carving",
            "slug": "wood-carving",
            "description": "Hand-carved wooden bowls with pearl shell and/or wood inlay design are polished and sealed. The oval-shaped bowls are carved from kerosene wood (Cordia subcordata), which has a warm brown tone and is termite resistant.",
            "material_category": "wood",
            "cultural_context": "Carving traditions vary by island and province. In Western Province, nguzunguzu (ship prow figures) are carved as protective spirits for canoes.",
            "cultural_context_review_flag": "reviewed",
        })

        self.stdout.write(self.style.SUCCESS(f"  ✓ {CraftPage.objects.count()} crafts"))

        # --- Step 5: Makers ---
        maker_julie = self._create_maker(makers_index, {
            "title": "Julie Mone",
            "slug": "julie-mone",
            "village": "Atori",
            "province": "Guadalcanal Province",
            "island": "Guadalcanal",
            "story": "I learned to weave from my mother when I was eight years old, sitting beside her on the veranda in Atori. She showed me how to split the pandanus leaf just right — too thick and the weave looks rough, too thin and it tears. Every bag I make carries that patience she taught me.",
            "story_cultural_review_flag": "reviewed",
            "consent_status": "Signed",
            "published_flag": True,
            "age": 42,
            "years_active": 34,
            "craft": craft_pandanus,
        })

        maker_peter = self._create_maker(makers_index, {
            "title": "Peter Kera",
            "slug": "peter-kera",
            "village": "Munda",
            "province": "Western Province",
            "island": "New Georgia",
            "story": "I carve because my father carved, and his father before him. In Munda we have always worked with kerosene wood — it is hard and beautiful when you finish it smooth. I make bowls and trays that people use every day. I like that something I shape with my hands ends up on someone's table far away.",
            "story_cultural_review_flag": "reviewed",
            "consent_status": "Signed",
            "published_flag": True,
            "age": 48,
            "years_active": 22,
            "craft": craft_wood,
        })

        self.stdout.write(self.style.SUCCESS(f"  ✓ {MakerPage.objects.count()} makers"))

        # --- Step 6: Products ---
        products_data = [
            {
                "title": "Shoulder Bag",
                "slug": "pandanus-shoulder-bag",
                "product_code": "P-M-1",
                "description": "A sturdy, light-weight bag hand-woven from natural pandanus with a traditional pattern from the maker's province.",
                "material_category": "pandanus",
                "product_type": "bags",
                "maker": maker_julie,
                "craft": craft_pandanus,
                "dimensions": "35cm × 28cm × 12cm",
                "care_notes": "Keep dry. Store flat or stuffed with tissue. Brush gently to remove dust.",
                "wholesale_price": 85.00,
            },
            {
                "title": "Clutch Purse (Small)",
                "slug": "pandanus-clutch-small",
                "product_code": "P-M-2",
                "description": "A compact clutch with a zip and a loop to put over your wrist in a finely woven pandanus. Will fit your mobile phone, lipstick, keys and a handkerchief.",
                "material_category": "pandanus",
                "product_type": "purses",
                "maker": maker_julie,
                "craft": craft_pandanus,
                "dimensions": "20cm × 13cm",
                "care_notes": "Keep dry. Avoid direct sunlight for extended periods.",
                "wholesale_price": 55.00,
            },
            {
                "title": "Small Round Bowl with Inlay",
                "slug": "wood-bowl-small-round",
                "product_code": "W-K-1",
                "description": "Hand-carved wooden bowl with pearl shell and/or wood inlay design around the edge. Polished and sealed, these bowls can be used to serve food or store small items.",
                "material_category": "wood",
                "product_type": "bowls",
                "maker": maker_peter,
                "craft": craft_wood,
                "dimensions": "About 9cm diameter",
                "care_notes": "Oil occasionally with food-safe wood oil. Hand wash only.",
                "wholesale_price": 45.00,
            },
            {
                "title": "Oval Bowl with Inlay",
                "slug": "wood-bowl-oval-inlay",
                "product_code": "W-K-2",
                "description": "Hand-carved wooden bowl with pearl shell and/or wood inlay design. Polished and sealed, these bowls can be used to serve dry food or store small items.",
                "material_category": "wood",
                "product_type": "bowls",
                "maker": maker_peter,
                "craft": craft_wood,
                "dimensions": "About 21cm L × 12cm W × 4cm H",
                "care_notes": "Oil occasionally with food-safe wood oil. Hand wash only. Keep away from direct heat.",
                "wholesale_price": 85.00,
            },
        ]

        for prod_data in products_data:
            self._create_product(products_index, prod_data)

        self.stdout.write(self.style.SUCCESS(f"  ✓ {ProductPage.objects.count()} products"))

        self.stdout.write("")
        self.stdout.write(self.style.SUCCESS("Done! Sample data seeded successfully."))
        self.stdout.write(f"  Visit http://localhost:3000 to see the public site")
        self.stdout.write(f"  Visit http://localhost:3000/admin/dashboard to see the admin panel")

    def _get_or_create_child(self, parent, title):
        """Get or create a plain Page as a container."""
        existing = parent.get_children().filter(title=title).first()
        if existing:
            return existing
        page = Page(title=title, slug=title.lower().replace(" ", "-"))
        parent.add_child(instance=page)
        return page

    def _create_craft(self, parent, data):
        """Create a CraftPage if it doesn't exist."""
        existing = CraftPage.objects.filter(slug=data["slug"]).first()
        if existing:
            return existing

        craft = CraftPage(
            title=data["title"],
            slug=data["slug"],
            description=data["description"],
            material_category=data["material_category"],
            cultural_context=data.get("cultural_context", ""),
            cultural_context_review_flag=data.get("cultural_context_review_flag", "unreviewed"),
        )
        parent.add_child(instance=craft)
        return craft

    def _create_maker(self, parent, data):
        """Create a MakerPage if it doesn't exist."""
        existing = MakerPage.objects.filter(slug=data["slug"]).first()
        if existing:
            return existing

        craft = data.pop("craft", None)
        maker = MakerPage(
            title=data["title"],
            slug=data["slug"],
            village=data["village"],
            province=data["province"],
            island=data["island"],
            story=data.get("story", ""),
            story_cultural_review_flag=data.get("story_cultural_review_flag", "unreviewed"),
            consent_status=data.get("consent_status", "Signed"),
            published_flag=data.get("published_flag", True),
            age=data.get("age"),
            years_active=data.get("years_active"),
            craft=craft,
        )
        parent.add_child(instance=maker)
        return maker

    def _create_product(self, parent, data):
        """Create a ProductPage if it doesn't exist."""
        existing = ProductPage.objects.filter(slug=data["slug"]).first()
        if existing:
            return existing

        maker = data.pop("maker", None)
        craft = data.pop("craft", None)

        product = ProductPage(
            title=data["title"],
            slug=data["slug"],
            product_code=data["product_code"],
            description=data["description"],
            material_category=data["material_category"],
            product_type=data["product_type"],
            maker=maker,
            craft=craft,
            dimensions=data.get("dimensions"),
            care_notes=data.get("care_notes"),
            wholesale_price=data["wholesale_price"],
            published_flag=True,
        )
        parent.add_child(instance=product)
        return product
