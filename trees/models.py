from django.db import models
from django.contrib.gis.db import models as gis_models
from django.contrib.gis.geos import Point
from users.models import User

class Tree(models.Model):
    # Health status choices
    class HealthChoices(models.TextChoices):
        EXCELLENT = ("80% - Excellent", "80% - Excellent")
        GOOD = ("60% - Fair", "60% - Fair")
        POOR = ("40% - Poor", "40% - Poor")
        CRITICAL = ("20% - Critical", "20% - Critical")
        DEAD = ("0% - Dead", "0% - Dead")
    
    # Basic identification
    tag_number = models.IntegerField(primary_key=True, verbose_name="Tag #")
    common_name = models.CharField(max_length=100, verbose_name="Common Name")
    botanical_name = models.CharField(max_length=100, verbose_name="Botanical Name")
    
    # Location
    latitude = models.FloatField()
    longitude = models.FloatField()
    location = gis_models.PointField(null=True, blank=True)
    
    # Physical characteristics
    diameter = models.CharField(max_length=20, null=True, blank=True)
    height = models.CharField(max_length=20, null=True, blank=True)
    crown_height = models.CharField(max_length=20, null=True, blank=True)
    crown_spread = models.CharField(max_length=20, null=True, blank=True)
    
    # Management data
    health = models.CharField(
        max_length=20,
        choices=HealthChoices.choices,
        null=True,
        blank=True
    )
    last_update = models.DateField(null=True, blank=True)
    notes = models.TextField(null=True, blank=True)
    alternate_tag = models.CharField(max_length=20, null=True, blank=True, verbose_name="Tag ##")
    quantity = models.IntegerField(default=1)
    
    # Relationships
    contributors = models.ManyToManyField(User, blank=True, related_name="contributed_trees")
    
    class Meta:
        verbose_name = "Tree"
        verbose_name_plural = "Trees"
    
    def __str__(self):
        return f"{self.tag_number} - {self.common_name}"
    
    def save(self, *args, **kwargs):
        # Create Point object based on latitude and longitude
        if self.latitude and self.longitude:
            self.location = Point(self.longitude, self.latitude)  # 주석 해제
        super().save(*args, **kwargs)

