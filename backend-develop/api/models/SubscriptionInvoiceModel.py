from django.db import models
from django.utils.timezone import now

from api.models.InvoiceModel import InvoiceModel
from api.models.SubscriptionModel import SubscriptionModel


class SubscriptionInvoiceModel(models.Model):
	
	class Meta:
		verbose_name = 'счет подписок'
		verbose_name_plural = 'Счета подписок'
	
	subscription = models.ForeignKey(
		to=SubscriptionModel,
		on_delete=models.CASCADE
	)
	invoice = models.ForeignKey(
		to=InvoiceModel,
		on_delete=models.CASCADE
	)
	created_at = models.DateTimeField(default=now)
