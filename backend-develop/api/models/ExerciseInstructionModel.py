from django.db import models
from django.utils.timezone import now
from django_editorjs_fields import EditorJsJSONField

from api.models.ExerciseInstructionType import ExerciseInstructionType
from api.models.ExerciseModel import ExerciseModel


class ExerciseInstructionModel(models.Model):
	
	class Meta:
		verbose_name = 'Инструкция упражнения'
		verbose_name_plural = 'Инструкции упражнений'
	
	exercise = models.ForeignKey(
		to=ExerciseModel,
		on_delete=models.CASCADE
	)
	description = models.TextField(blank=False, null=False)
	type = models.CharField(max_length=2, choices=ExerciseInstructionType.choices)
	video_url = models.URLField(blank=False, null=False)
	instruction = EditorJsJSONField(
		blank=False,
		null=False,
		plugins=[
			"@editorjs/header",
			"@editorjs/list",
			"@editorjs/paragraph",
			"@editorjs/delimiter",
		]
	)
	updated_at = models.DateTimeField(auto_now=True)
	created_at = models.DateTimeField(default=now)
