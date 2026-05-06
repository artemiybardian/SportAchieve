from django.db import models


class GYMLocationModel(models.Model):
	class Meta:
		verbose_name = 'Адрес'
		verbose_name_plural = 'Адреса'
	
	address = models.TextField(unique=True)
	
	def __str__(self):
		return self.address
	