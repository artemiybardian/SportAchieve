from enum import Enum

from django.db.models.enums import TextChoices


class ExerciseInstructionType(TextChoices, Enum):
	MALE = "M"
	FEMALE = "F"
	ALL = "A"
