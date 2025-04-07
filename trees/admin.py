from django.contrib import admin
from django.contrib.gis.admin import GISModelAdmin
from .models import Tree

@admin.register(Tree)
class TreeAdmin(GISModelAdmin):
    list_display = (
        'tag_number', 
        'common_name', 
        'botanical_name',
        'height',
        'diameter',
        'health', 
        'last_update',
        )
    list_filter = (
        'common_name', 
        'height',
        'diameter',
        'health',
        'last_update',
        )
    search_fields = (
        'tag_number', 
        'common_name', 
        'botanical_name',
        'notes',
        )
    
    # Display the map in the admin interface
    gis_widget_kwargs = {
        'attrs': {
            'default_zoom': 15,
            'default_lon': -122.04499476044137,
            'default_lat': 37.31930349325796,
        },
    }
