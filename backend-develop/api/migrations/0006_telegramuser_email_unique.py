from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0005_alter_exerciseinstructionmodel_type'),
    ]

    operations = [
        migrations.AlterField(
            model_name='telegramuser',
            name='email',
            field=models.EmailField(blank=True, max_length=254, unique=True, verbose_name='email address', null=True),
        ),
    ]
