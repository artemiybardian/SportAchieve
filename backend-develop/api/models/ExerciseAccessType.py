from django.db.models import TextChoices


class ExerciseAccessType(TextChoices):
	PAID = "PAID", "Платное"
	FREE = "FREE", "Бесплатное"
