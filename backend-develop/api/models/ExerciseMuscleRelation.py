from django.db import models
from django.utils import timezone

from api.models.ExerciseModel import ExerciseModel
from api.models.MuscleModel import MuscleModel


class ExerciseMuscleRelation(models.Model):
	class Meta:
		verbose_name = 'Мышца в упражнение'
		verbose_name_plural = 'Мышцы в упражнениях'
	
	exercise = models.ForeignKey(
		to=ExerciseModel,
		on_delete=models.CASCADE
	)
	muscle = models.ForeignKey(
		to=MuscleModel,
		on_delete=models.CASCADE
	)
	created_at = models.DateTimeField(default=timezone.now)
