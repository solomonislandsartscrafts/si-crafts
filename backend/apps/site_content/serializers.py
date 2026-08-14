from rest_framework import serializers
from .models import SiteContent


# Mapping of camelCase frontend keys → snake_case model fields
FIELD_MAP = {
    # Images (existing)
    "aboutSolomonIslandsImage": "about_solomon_islands_image_url",
    "aboutSolomonIslandsImageAlt": "about_solomon_islands_image_alt",
    "aboutTeamImage": "about_team_image_url",
    "aboutTeamImageAlt": "about_team_image_alt",
    "whyWeDoThisImage": "why_we_do_this_image_url",
    "whyWeDoThisImageAlt": "why_we_do_this_image_alt",
    # Homepage
    "homepageHeading": "homepage_heading",
    "homepageIntro": "homepage_intro",
    "homepageCtaText": "homepage_cta_text",
    "homepageMakersHeading": "homepage_makers_heading",
    "homepageMakersIntro": "homepage_makers_intro",
    # About page text
    "aboutPageIntro": "about_page_intro",
    "aboutSolomonIslandsText": "about_solomon_islands_text",
    "aboutTeamText": "about_team_text",
    "aboutWhyText": "about_why_text",
    # Wholesale
    "wholesaleIntro": "wholesale_intro",
    "wholesaleHowItWorks": "wholesale_how_it_works",
    "wholesaleMinimumOrder": "wholesale_minimum_order",
    # Care Guide
    "careGuideIntro": "care_guide_intro",
    "careGuidePandanus": "care_guide_pandanus",
    "careGuideWood": "care_guide_wood",
    "careGuideShell": "care_guide_shell",
    # Contact
    "contactIntro": "contact_intro",
    "contactEmail": "contact_email",
    "contactResponseTime": "contact_response_time",
}

# Reverse mapping: snake_case → camelCase
REVERSE_MAP = {v: k for k, v in FIELD_MAP.items()}


class SiteContentSerializer(serializers.Serializer):
    """
    Site content serializer — handles camelCase ↔ snake_case mapping.
    All fields are optional strings (blank allowed).
    """

    # Declare all fields so DRF validates them
    # Images
    about_solomon_islands_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    about_solomon_islands_image_alt = serializers.CharField(required=False, allow_blank=True, default="")
    about_team_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    about_team_image_alt = serializers.CharField(required=False, allow_blank=True, default="")
    why_we_do_this_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    why_we_do_this_image_alt = serializers.CharField(required=False, allow_blank=True, default="")
    # Homepage
    homepage_heading = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)
    homepage_intro = serializers.CharField(required=False, allow_blank=True, default="")
    homepage_cta_text = serializers.CharField(required=False, allow_blank=True, default="", max_length=100)
    homepage_makers_heading = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)
    homepage_makers_intro = serializers.CharField(required=False, allow_blank=True, default="")
    # About
    about_page_intro = serializers.CharField(required=False, allow_blank=True, default="")
    about_solomon_islands_text = serializers.CharField(required=False, allow_blank=True, default="")
    about_team_text = serializers.CharField(required=False, allow_blank=True, default="")
    about_why_text = serializers.CharField(required=False, allow_blank=True, default="")
    # Wholesale
    wholesale_intro = serializers.CharField(required=False, allow_blank=True, default="")
    wholesale_how_it_works = serializers.CharField(required=False, allow_blank=True, default="")
    wholesale_minimum_order = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)
    # Care Guide
    care_guide_intro = serializers.CharField(required=False, allow_blank=True, default="")
    care_guide_pandanus = serializers.CharField(required=False, allow_blank=True, default="")
    care_guide_wood = serializers.CharField(required=False, allow_blank=True, default="")
    care_guide_shell = serializers.CharField(required=False, allow_blank=True, default="")
    # Contact
    contact_intro = serializers.CharField(required=False, allow_blank=True, default="")
    contact_email = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)
    contact_response_time = serializers.CharField(required=False, allow_blank=True, default="", max_length=200)

    def to_representation(self, instance):
        """Output camelCase keys for the frontend."""
        result = {}
        for camel_key, snake_field in FIELD_MAP.items():
            result[camel_key] = getattr(instance, snake_field, "") or ""
        return result

    def update(self, instance, validated_data):
        """Update only the fields that were provided."""
        for snake_field, value in validated_data.items():
            if hasattr(instance, snake_field):
                setattr(instance, snake_field, value)
        instance.save()
        return instance
