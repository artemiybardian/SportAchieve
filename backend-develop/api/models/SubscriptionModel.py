from datetime import timedelta
from typing import Optional

from django.conf import settings
from django.db import models
from django.utils import timezone

from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.InvoiceModel import InvoiceModel
from api.models.InvoiceStatus import InvoiceStatus


class SubscriptionModel(models.Model):
	
	class Meta:
		verbose_name = 'Подписка'
		verbose_name_plural = 'Подписки'
		constraints = [
			models.UniqueConstraint(
				fields=['type', 'user'],
				name='unique_subscription_per_type_per_user'
			)
		]
	
	type = models.ForeignKey(
		to=SubscriptionTypeModel,
		on_delete=models.CASCADE
	)
	user = models.ForeignKey(
		to=settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE
	)
	is_enabled = models.BooleanField(default=True)
	updated_at = models.DateTimeField(auto_now=True)
	renewed_at = models.DateTimeField(default=None, blank=True, null=True)
	canceled_at = models.DateTimeField(default=None, blank=True, null=True)
	created_at = models.DateTimeField(default=timezone.now)

	def __str__(self):
		return f"Subscription {self.type} for @{self.user.username}"

	def get_latest_valid_invoice(self) -> Optional[InvoiceModel]:
		invoices = InvoiceModel.objects.filter(
			user=self.user,
			type=self.type,
			status=InvoiceStatus.SUCCEEDED
		).order_by('-created_at')

		for invoice in invoices:
			expiration_date = invoice.updated_at + timedelta(days=self.type.access_duration_in_days)
			if expiration_date > timezone.now():
				return invoice

		return None
	
	@property
	def is_valid(self) -> bool:
		return self.get_latest_valid_invoice() is not None
