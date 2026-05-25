from django.db import migrations


def normalize_empty_emails(apps, schema_editor):
    User = apps.get_model("api", "TelegramUser")
    User.objects.filter(email="").update(email=None)


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0013_qrcode_add_max_source"),
    ]

    operations = [
        migrations.RunPython(normalize_empty_emails, migrations.RunPython.noop),
    ]
