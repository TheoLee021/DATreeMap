from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize
from .models import Tree
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import TreeGeoSerializer, TreeDetailSerializer

def tree_map(request):
    """트리 지도 페이지를 표시합니다."""
    return render(request, 'trees/map.html')

def tree_data(request):
    """모든 트리 데이터를 GeoJSON 형식으로 제공합니다."""
    trees = Tree.objects.all()
    geojson = serialize('geojson', trees, 
                       geometry_field='location',
                       fields=('tag_number', 'common_name', 'botanical_name', 
                               'health', 'diameter', 'height'))
    return JsonResponse(eval(geojson), safe=False)

def tree_detail(request, tag_number):
    """특정 트리의 상세 정보를 제공합니다."""
    try:
        tree = Tree.objects.get(tag_number=tag_number)
        data = {
            'tag_number': tree.tag_number,
            'common_name': tree.common_name,
            'botanical_name': tree.botanical_name,
            'latitude': tree.latitude,
            'longitude': tree.longitude,
            'diameter': tree.diameter,
            'height': tree.height,
            'crown_height': tree.crown_height,
            'crown_spread': tree.crown_spread,
            'health': tree.health,
            'last_update': tree.last_update.strftime('%Y-%m-%d') if tree.last_update else None,
            'notes': tree.notes,
            'alternate_tag': tree.alternate_tag,
            'quantity': tree.quantity,
        }
        return JsonResponse(data)
    except Tree.DoesNotExist:
        return JsonResponse({'error': 'Tree not found'}, status=404)

class TreeViewSet(viewsets.ReadOnlyModelViewSet):
    """트리 데이터를 제공하는 API 뷰셋"""
    queryset = Tree.objects.all().select_related().prefetch_related()
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ['health', 'common_name']
    search_fields = ['tag_number', 'common_name', 'botanical_name']
    
    def get_serializer_class(self):
        if self.action == 'retrieve':
            return TreeDetailSerializer
        return TreeGeoSerializer

def drf_test_view(request):
    """DRF API 테스트 페이지"""
    return render(request, 'trees/drf_test.html')
