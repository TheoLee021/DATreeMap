from django.db import models
from django.utils import timezone

class CommonModel(models.Model):
    created_at = models.DateTimeField(default=timezone.now, verbose_name="Created at")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

    class Meta:
        abstract = True