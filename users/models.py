from django.db import models
from django.contrib.auth.models import AbstractUser

class User(AbstractUser):
    class GenderChoices(models.TextChoices):
        MALE = ("male", "Male")
        FEMALE = ("female", "Female")
        OTHER = ("other", "Other")
    class LanguageChoices(models.TextChoices):
        EN = ("en", "English")
        KR = ("kr", "Korean")
    first_name = models.CharField(
        max_length=150, 
        editable=False, 
        blank=True,
    )
    last_name = models.CharField(
        max_length=150, 
        editable=False, 
        blank=True,
    )
    profile_photo = models.ImageField(blank=True)
    name = models.CharField(
        max_length=150, 
        blank=True,
    )
    is_contributor = models.BooleanField(
        default=False,
    )
    gender = models.CharField(
        max_length=10, 
        choices=GenderChoices.choices,
    )
    language = models.CharField(
        max_length=2,
        choices=LanguageChoices.choices,
    )