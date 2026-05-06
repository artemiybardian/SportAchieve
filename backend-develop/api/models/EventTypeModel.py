from django.db import models
from django.utils import timezone


class EventTypeModel(models.Model):
	class Meta:
		verbose_name = 'Тип логов'
		verbose_name_plural = 'Типы логов'
	
	name = models.TextField(blank=False, null=False)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=timezone.now)
	
	def __str__(self):
		return self.name
	