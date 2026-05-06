from django.db import models

from api.models.SubscriptionScopeType import SubscriptionScopeType


class SubscriptionTypeModel(models.Model):
	class Meta:
		verbose_name = 'Тип подписки'
		verbose_name_plural = 'Типы подписок'
	
	name = models.TextField(blank=False, null=False)
	description = models.TextField(blank=False, null=False)
	price = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
	access_duration_in_days = models.PositiveIntegerField()
	scope_type = models.CharField(
		max_length=50,
		choices=SubscriptionScopeType.choices,
		blank=False,
		null=False
	)
	
	def __str__(self):
		return f"{self.name} for {self.access_duration_in_days} days for {self.scope_type}"
