from django.db import models
from django.utils import timezone

from api.models.ExerciseModel import ExerciseModel
from api.models.SubscriptionTypeModel import SubscriptionTypeModel


class SubscriptionTypeScopeModel(models.Model):
	
	class Meta:
		verbose_name = 'Область действия типа подписки'
		verbose_name_plural = 'Области действий типов подписок'
	
	type = models.ForeignKey(
		to=SubscriptionTypeModel,
		on_delete=models.CASCADE
	)
	exercise = models.ForeignKey(
		to=ExerciseModel,
		on_delete=models.CASCADE,
		blank=True,
		null=True,
		default=None
	)
	created_at = models.DateTimeField(default=timezone.now)
