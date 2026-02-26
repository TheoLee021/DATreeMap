from rest_framework_gis.serializers import GeoFeatureModelSerializer
from rest_framework import serializers
from .models import Tree


class TreeDetailSerializer(serializers.ModelSerializer):
    """Serializer for general tree detail information"""

    # DRF uses snake_case, so explicit field specification can be used when needed
    # Example: last_update = serializers.DateField(format='%Y-%m-%d')

    class Meta:
        model = Tree
        fields = "__all__"


class TreeGeoSerializer(GeoFeatureModelSerializer):
    """Serializer that provides tree data in GeoJSON format"""

    class Meta:
        model = Tree
        geo_field = "location"
        fields = (
            "tag_number",
            "common_name",
            "botanical_name",
            "health",
            "diameter",
            "height",
            "crown_height",
            "crown_spread",
            "last_update",
            "notes",
            "quantity",
            "alternate_tag",  # Added alternate_tag field
        )
        # Use alternate_tag as the id for GeoJSON Feature
        # When this setting is enabled, the field is excluded from properties
        # id_field = 'alternate_tag'
