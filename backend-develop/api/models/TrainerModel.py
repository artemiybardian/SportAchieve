import uuid as uuid_lib

from django.db import models
from django.utils import timezone

from api.models.ExerciseModel import ExerciseModel


class TrainerModel(models.Model):
	class Meta:
		verbose_name = 'Тренажёр'
		verbose_name_plural = 'Тренажёры'
	
	uuid = models.UUIDField(default=uuid_lib.uuid4, unique=True, editable=False)
	name = models.CharField('Название', blank=False, null=False, max_length=512)
	photo = models.ImageField('Фото', blank=False, null=False, upload_to='trainers/')
	description = models.TextField('Описание', blank=False, null=False)
	exercises = models.ManyToManyField(
		to=ExerciseModel,
		through="TrainerExerciseRelation",
		related_name="trainers"
	)
	updated_at = models.DateTimeField('Обновлено', auto_now=True)
	created_at = models.DateTimeField('Создано', default=timezone.now)
	
	def __str__(self):
		return self.name
	