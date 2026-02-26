from django.test import TestCase

from .models import User


class UserModelTests(TestCase):
    def test_required_fields_include_profile_required_fields(self):
        self.assertIn("email", User.REQUIRED_FIELDS)
        self.assertIn("gender", User.REQUIRED_FIELDS)
        self.assertIn("language", User.REQUIRED_FIELDS)
