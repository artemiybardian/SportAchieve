from django.conf import settings
from django.db import models
from django.utils import timezone

from api.models.EventTypeModel import EventTypeModel


class EventLogModel(models.Model):
	class Meta:
		verbose_name = 'Лог события'
		verbose_name_plural = 'Логи событий'
	
	event_type = models.ForeignKey(
		to=EventTypeModel,
		on_delete=models.CASCADE
	)
	user = models.ForeignKey(
		to=settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE
	)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=timezone.now)
	