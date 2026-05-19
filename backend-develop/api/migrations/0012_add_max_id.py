from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_qrcode_add_vk_source'),
    ]

    operations = [
        migrations.AddField(
            model_name='telegramuser',
            name='max_id',
            field=models.BigIntegerField(
                blank=True,
                db_index=True,
                null=True,
                unique=True,
                verbose_name='MAX ID',
            ),
        ),
    ]
