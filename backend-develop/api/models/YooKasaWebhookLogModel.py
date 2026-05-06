from django.db import models
from django.utils import timezone

from api.models.InvoiceModel import InvoiceModel


class YooKasaWebhookLogModel(models.Model):
	class Meta:
		verbose_name = 'Лог ЮКассы'
		verbose_name_plural = 'Логи ЮКассы'
	
	invoice = models.ForeignKey(
		to=InvoiceModel,
		on_delete=models.CASCADE,
	)
	body = models.JSONField(null=False, blank=False, default=dict)
	created_at = models.DateTimeField(default=timezone.now)
	
	def __str__(self):
		return f"Log #{self.id} for '{self.invoice}'"
