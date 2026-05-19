from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_add_max_id'),
    ]

    operations = [
        migrations.AlterField(
            model_name='qrcodemodel',
            name='source',
            field=models.CharField(
                choices=[
                    ('telegram', 'Telegram'),
                    ('site', 'Сайт / PWA'),
                    ('vk', 'ВКонтакте'),
                    ('max', 'MAX'),
                ],
                default='site',
                max_length=20,
                verbose_name='Платформа',
            ),
        ),
    ]
