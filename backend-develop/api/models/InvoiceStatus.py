from enum import Enum

from django.db.models.enums import TextChoices


class InvoiceStatus(TextChoices, Enum):
	PENDING = "pending"
	WAITING_FOR_CAPTURE = "waiting_for_capture"
	SUCCEEDED = "succeeded"
	CANCELED = "canceled"
