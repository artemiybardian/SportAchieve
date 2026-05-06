from enum import Enum

from django.db.models import TextChoices


class SubscriptionScopeType(TextChoices, Enum):
	ALL = "ALL"
	ONE = "ONE"
	SELECT = "SELECT"
