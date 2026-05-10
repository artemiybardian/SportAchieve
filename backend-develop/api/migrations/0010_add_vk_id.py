from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0009_qrcode_default_site'),
    ]

    operations = [
        migrations.AddField(
            model_name='telegramuser',
            name='vk_id',
            field=models.BigIntegerField(
                blank=True,
                db_index=True,
                null=True,
                unique=True,
                verbose_name='VK ID',
            ),
        ),
    ]
