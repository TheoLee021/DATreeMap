from django.test import Client, TestCase, override_settings

from .models import Tree


class TreeModelTests(TestCase):
    def test_save_sets_location_for_zero_coordinates(self):
        tree = Tree.objects.create(
            tag_number=1001,
            common_name="Zero Tree",
            botanical_name="Zero Botanical",
            latitude=0.0,
            longitude=0.0,
            height="10 ft",
            diameter="2 in",
        )

        self.assertIsNotNone(tree.location)
        self.assertEqual(tree.location.x, 0.0)
        self.assertEqual(tree.location.y, 0.0)


class TreeViewTests(TestCase):
    def setUp(self):
        self.client = Client()

    @override_settings(ALLOWED_HOSTS=["testserver"])
    def test_tree_data_handles_nullable_fields(self):
        Tree.objects.create(
            tag_number=2001,
            common_name="Nullable Tree",
            botanical_name="Nullable Botanical",
            latitude=37.3,
            longitude=-122.0,
            health=None,
            height=None,
            diameter=None,
        )

        response = self.client.get("/api/trees/")

        self.assertEqual(response.status_code, 200)
        payload = response.json()
        self.assertEqual(payload["type"], "FeatureCollection")
        self.assertEqual(len(payload["features"]), 1)
        self.assertIsNone(payload["features"][0]["properties"]["health"])

    @override_settings(ALLOWED_HOSTS=["testserver"])
    def test_list_sorts_height_numerically(self):
        Tree.objects.create(
            tag_number=3001,
            common_name="Tall Tree",
            botanical_name="Tall Botanical",
            latitude=37.3,
            longitude=-122.0,
            height="100 ft",
            diameter="10 in",
        )
        Tree.objects.create(
            tag_number=3002,
            common_name="Short Tree",
            botanical_name="Short Botanical",
            latitude=37.31,
            longitude=-122.01,
            height="20 ft",
            diameter="2 in",
        )

        response = self.client.get("/list/?sort=height&order=asc")

        self.assertEqual(response.status_code, 200)
        content = response.content.decode("utf-8")
        self.assertLess(content.find("20 ft"), content.find("100 ft"))
