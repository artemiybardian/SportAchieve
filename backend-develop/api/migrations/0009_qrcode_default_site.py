from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0008_trainermodel_uuid'),
    ]

    operations = [
        migrations.AlterField(
            model_name='qrcodemodel',
            name='source',
            field=models.CharField(
                choices=[
                    ('telegram', 'Telegram'),
                    ('site', 'Сайт / PWA'),
                ],
                default='site',
                max_length=20,
                verbose_name='Платформа',
            ),
        ),
    ]
