from django.conf import settings
from django.db import models
from django.utils import timezone


class UserPaymentMethodModel(models.Model):
	
	class Meta:
		verbose_name = 'Сохраненный метод оплаты ЮКассы'
		verbose_name_plural = 'Сохраненные методы оплаты ЮКассы'
	
	id = models.CharField(max_length=36, blank=False, null=False, primary_key=True)
	user = models.ForeignKey(
		to=settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE
	)
	title = models.TextField(blank=False, null=False)
	type = models.CharField(max_length=512, blank=False, null=False)
	card_info = models.JSONField(default=dict, blank=False, null=False)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=timezone.now)
