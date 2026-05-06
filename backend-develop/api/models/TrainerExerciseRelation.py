from django.db import models
from django.utils import timezone

from api.models.ExerciseModel import ExerciseModel
from api.models.TrainerModel import TrainerModel


class TrainerExerciseRelation(models.Model):
	class Meta:
		verbose_name = 'Упражнение в тренажере'
		verbose_name_plural = 'Упражнения в тренажерах'
		
	exercise = models.ForeignKey(
		to=ExerciseModel,
		on_delete=models.CASCADE,
		verbose_name='Упражнение',
	)
	trainer = models.ForeignKey(
		to=TrainerModel,
		on_delete=models.CASCADE,
		verbose_name='Тренажёр',
	)
	show = models.BooleanField('Показывать', default=True)
	created_at = models.DateTimeField('Создано', default=timezone.now)
