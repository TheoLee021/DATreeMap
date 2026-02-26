from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

app_name = "trees"

# 기존 URL 패턴 유지
urlpatterns = [
    path("", views.tree_map, name="map"),
    path("list/", views.tree_list, name="list"),
    path("api/trees/", views.tree_data, name="tree_data"),
    path("api/trees/<int:tag_number>/", views.tree_detail, name="tree_detail"),
    path("drf-test/", views.drf_test_view, name="drf-test"),  # 테스트 페이지 URL 추가
]

# REST Framework API 라우터 설정 (별도의 URL 패턴 사용)
router = DefaultRouter()
router.register("trees", views.TreeViewSet, basename="tree-api")

# DRF URL 패턴 추가 (별도의 패턴)
urlpatterns += [
    path("api/rest/", include(router.urls)),
]
