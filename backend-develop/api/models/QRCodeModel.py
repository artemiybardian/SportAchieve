from django.db import models
from django.utils import timezone

from api.models.GYMLocationModel import GYMLocationModel
from api.models.SourceType import SourceType
from api.models.TrainerModel import TrainerModel


class QRCodeModel(models.Model):

	class Meta:
		verbose_name = 'QR-код'
		verbose_name_plural = 'QR-коды'

	location = models.ForeignKey(
		to=GYMLocationModel,
		on_delete=models.CASCADE,
		verbose_name='Адрес зала',
	)
	trainer = models.ForeignKey(
		to=TrainerModel,
		on_delete=models.CASCADE,
		verbose_name='Тренажёр',
	)
	source = models.CharField(
		max_length=20,
		choices=SourceType.choices,
		default=SourceType.SITE,
		verbose_name='Платформа',
	)
	updated_at = models.DateTimeField('Обновлено', auto_now=True)
	created_at = models.DateTimeField('Создано', default=timezone.now)

	def __str__(self):
		if self.pk is None:
			return 'QR-код (новый)'
		if self.trainer_id and self.location_id:
			return f'{self.trainer} — {self.location}'
		return f'QR-код #{self.pk}'
