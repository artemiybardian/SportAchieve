from django.db import models
from django.utils import timezone


class MuscleModel(models.Model):
	class Meta:
		verbose_name = 'Мышца'
		verbose_name_plural = 'Мышцы'
	
	name = models.TextField(blank=False, null=False)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=timezone.now)
	
	def __str__(self):
		return self.name
	