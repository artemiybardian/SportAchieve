from django.conf import settings
from django.db import models
from django.utils import timezone

from api.models.InvoiceStatus import InvoiceStatus
from api.models.SubscriptionTypeModel import SubscriptionTypeModel


class InvoiceModel(models.Model):
	class Meta:
		verbose_name = 'Счет'
		verbose_name_plural = 'Счета'
	
	user = models.ForeignKey(
		to=settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE
	)
	description = models.TextField(blank=False, null=False)
	idempotence_key = models.CharField(max_length=128, blank=False, null=False)
	type = models.ForeignKey(
		to=SubscriptionTypeModel,
		on_delete=models.CASCADE
	)
	status = models.CharField(max_length=50, choices=InvoiceStatus.choices, default=InvoiceStatus.PENDING, blank=False, null=False)
	confirmation_url = models.URLField(blank=False, null=True, default=None)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"Invoice #{self.id} ({self.type}) for {self.user.username}"
