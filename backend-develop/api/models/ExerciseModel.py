from django.db import models
from django.utils import timezone

from api.models.ExerciseAccessType import ExerciseAccessType


class ExerciseModel(models.Model):
	
	class Meta:
		verbose_name = 'Упражнение'
		verbose_name_plural = 'Упражнения'
	
	name = models.CharField('Название', blank=False, null=False, max_length=512)
	description = models.TextField('Описание', blank=False, null=False)
	cover = models.ImageField(
		'Картинка',
		blank=True,
		null=True,
		default=None,
		upload_to='exercises/',
	)
	access_type = models.CharField(
		'Тип доступа',
		max_length=50,
		choices=ExerciseAccessType.choices,
		default=ExerciseAccessType.FREE,
	)
	updated_at = models.DateTimeField('Обновлено', auto_now=True)
	created_at = models.DateTimeField('Создано', default=timezone.now)

	@property
	def muscles(self):
		return [rel.muscle for rel in self.exercisemusclerelation_set.all()]
	
	def __str__(self):
		return self.name
	