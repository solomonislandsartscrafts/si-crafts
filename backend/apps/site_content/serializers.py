from rest_framework import serializers
from .models import SiteContent


class SiteContentSerializer(serializers.Serializer):
    """
    Site content uses image URLs directly (not Wagtail image IDs).
    The frontend uploads images and stores the URL string.
    """
    about_solomon_islands_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    about_solomon_islands_image_alt = serializers.CharField(required=False, allow_blank=True, default="")
    about_team_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    about_team_image_alt = serializers.CharField(required=False, allow_blank=True, default="")
    why_we_do_this_image_url = serializers.CharField(required=False, allow_blank=True, default="")
    why_we_do_this_image_alt = serializers.CharField(required=False, allow_blank=True, default="")

    def to_representation(self, instance):
        return {
            "aboutSolomonIslandsImage": instance.about_solomon_islands_image_url,
            "aboutSolomonIslandsImageAlt": instance.about_solomon_islands_image_alt,
            "aboutTeamImage": instance.about_team_image_url,
            "aboutTeamImageAlt": instance.about_team_image_alt,
            "whyWeDoThisImage": instance.why_we_do_this_image_url,
            "whyWeDoThisImageAlt": instance.why_we_do_this_image_alt,
        }

    def update(self, instance, validated_data):
        if "about_solomon_islands_image_url" in validated_data:
            instance.about_solomon_islands_image_url = validated_data["about_solomon_islands_image_url"]
        if "about_solomon_islands_image_alt" in validated_data:
            instance.about_solomon_islands_image_alt = validated_data["about_solomon_islands_image_alt"]
        if "about_team_image_url" in validated_data:
            instance.about_team_image_url = validated_data["about_team_image_url"]
        if "about_team_image_alt" in validated_data:
            instance.about_team_image_alt = validated_data["about_team_image_alt"]
        if "why_we_do_this_image_url" in validated_data:
            instance.why_we_do_this_image_url = validated_data["why_we_do_this_image_url"]
        if "why_we_do_this_image_alt" in validated_data:
            instance.why_we_do_this_image_alt = validated_data["why_we_do_this_image_alt"]
        instance.save()
        return instance
