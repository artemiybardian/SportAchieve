from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0006_telegramuser_email_unique'),
    ]

    operations = [
        migrations.AddField(
            model_name='telegramuser',
            name='source',
            field=models.CharField(
                choices=[
                    ('telegram', 'Telegram'),
                    ('site', 'Сайт / PWA'),
                    ('vk', 'ВКонтакте'),
                    ('max', 'MAX'),
                ],
                default='telegram',
                max_length=20,
                verbose_name='Источник',
            ),
        ),
        migrations.AddField(
            model_name='qrcodemodel',
            name='source',
            field=models.CharField(
                choices=[
                    ('telegram', 'Telegram'),
                    ('site', 'Сайт / PWA'),
                ],
                default='telegram',
                max_length=20,
                verbose_name='Платформа',
            ),
        ),
        migrations.AlterModelOptions(
            name='telegramuser',
            options={
                'verbose_name': 'Пользователь',
                'verbose_name_plural': 'Пользователи',
            },
        ),
    ]
