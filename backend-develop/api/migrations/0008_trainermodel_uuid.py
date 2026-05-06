import uuid
from django.db import migrations, models


def populate_uuids(apps, schema_editor):
    TrainerModel = apps.get_model('api', 'TrainerModel')
    for trainer in TrainerModel.objects.all():
        trainer.uuid = uuid.uuid4()
        trainer.save(update_fields=['uuid'])


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0007_add_source_fields'),
    ]

    operations = [
        # 1. Добавляем поле без unique — временно разрешаем дубли
        migrations.AddField(
            model_name='trainermodel',
            name='uuid',
            field=models.UUIDField(null=True, blank=True, editable=False),
        ),
        # 2. Заполняем уникальными UUID каждую строку
        migrations.RunPython(populate_uuids, migrations.RunPython.noop),
        # 3. Делаем поле обязательным и уникальным
        migrations.AlterField(
            model_name='trainermodel',
            name='uuid',
            field=models.UUIDField(default=uuid.uuid4, unique=True, editable=False),
        ),
    ]
