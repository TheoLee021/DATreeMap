import json
from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize
from django.core.paginator import Paginator
from .models import Tree
from rest_framework import viewsets, filters
from django_filters.rest_framework import DjangoFilterBackend
from .serializers import TreeGeoSerializer, TreeDetailSerializer
from django.db.models import Q, F, FloatField, Value
from django.db.models.functions import Cast, Coalesce
from django.db.models.expressions import Func


def tree_map(request):
    """트리 지도 페이지를 표시합니다."""
    return render(request, "trees/map.html")


def tree_list(request):
    """일반 유저를 위한 나무 목록 페이지를 표시합니다."""
    # 검색 및 필터링
    search_query = request.GET.get("search", "")
    common_name_filter = request.GET.get("common_name", "")
    health_filter = request.GET.get("health", "")
    sort_by = request.GET.get("sort", "tag_number")
    order = request.GET.get("order", "asc")

    trees = Tree.objects.all()

    if search_query:
        trees = trees.filter(
            Q(tag_number__icontains=search_query)
            | Q(common_name__icontains=search_query)
            | Q(botanical_name__icontains=search_query)
        )

    if common_name_filter:
        trees = trees.filter(common_name=common_name_filter)

    if health_filter:
        trees = trees.filter(health=health_filter)

    # 정렬 가능한 필드들
    sortable_fields = {
        "tag_number": "tag_number",
        "common_name": "common_name",
        "botanical_name": "botanical_name",
        "height": "height",
        "diameter": "diameter",
        "health": "health",
        "last_update": "last_update",
    }

    # 정렬 적용
    if sort_by in sortable_fields:
        order_field = sortable_fields[sort_by]
        if sort_by in {"height", "diameter"}:
            numeric_order_field = f"{sort_by}_numeric"
            trees = trees.annotate(
                **{
                    numeric_order_field: Coalesce(
                        Cast(
                            Func(
                                Func(
                                    F(sort_by),
                                    Value(r"[^0-9.]"),
                                    Value(""),
                                    Value("g"),
                                    function="regexp_replace",
                                ),
                                Value(""),
                                function="NULLIF",
                            ),
                            FloatField(),
                        ),
                        Value(0.0),
                    )
                }
            )
            order_field = numeric_order_field
        if order == "desc":
            order_field = f"-{order_field}"
        trees = trees.order_by(order_field)
    else:
        trees = trees.order_by("tag_number")

    # 페이지네이션
    paginator = Paginator(trees, 20)  # 페이지당 20개 항목
    page_number = request.GET.get("page")
    page_obj = paginator.get_page(page_number)

    # 필터 선택지 가져오기
    common_name_choices = (
        Tree.objects.values_list("common_name", flat=True)
        .exclude(common_name__isnull=True)
        .exclude(common_name__exact="")
        .distinct()
        .order_by("common_name")
    )
    health_choices = (
        Tree.objects.values_list("health", flat=True).distinct().order_by("health")
    )

    context = {
        "page_obj": page_obj,
        "search_query": search_query,
        "common_name_filter": common_name_filter,
        "health_filter": health_filter,
        "common_name_choices": common_name_choices,
        "health_choices": health_choices,
        "sort_by": sort_by,
        "order": order,
        "sortable_fields": sortable_fields,
    }

    return render(request, "trees/list.html", context)


def tree_data(request):
    """모든 트리 데이터를 GeoJSON 형식으로 제공합니다."""
    trees = Tree.objects.all()
    geojson = serialize(
        "geojson",
        trees,
        geometry_field="location",
        fields=(
            "tag_number",
            "common_name",
            "botanical_name",
            "health",
            "diameter",
            "height",
        ),
    )
    return JsonResponse(json.loads(geojson))


def tree_detail(request, tag_number):
    """특정 트리의 상세 정보를 제공합니다."""
    try:
        tree = Tree.objects.get(tag_number=tag_number)
        data = {
            "tag_number": tree.tag_number,
            "common_name": tree.common_name,
            "botanical_name": tree.botanical_name,
            "latitude": tree.latitude,
            "longitude": tree.longitude,
            "diameter": tree.diameter,
            "height": tree.height,
            "crown_height": tree.crown_height,
            "crown_spread": tree.crown_spread,
            "health": tree.health,
            "last_update": (
                tree.last_update.strftime("%Y-%m-%d") if tree.last_update else None
            ),
            "notes": tree.notes,
            "alternate_tag": tree.alternate_tag,
            "quantity": tree.quantity,
        }
        return JsonResponse(data)
    except Tree.DoesNotExist:
        return JsonResponse({"error": "Tree not found"}, status=404)


class TreeViewSet(viewsets.ReadOnlyModelViewSet):
    """트리 데이터를 제공하는 API 뷰셋"""

    queryset = Tree.objects.all().select_related().prefetch_related()
    pagination_class = None
    filter_backends = [DjangoFilterBackend, filters.SearchFilter]
    filterset_fields = ["health", "common_name"]
    search_fields = ["tag_number", "common_name", "botanical_name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return TreeDetailSerializer
        return TreeGeoSerializer


def drf_test_view(request):
    """DRF API 테스트 페이지"""
    return render(request, "trees/drf_test.html")
