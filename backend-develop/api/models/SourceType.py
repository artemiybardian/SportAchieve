from django.db import models


class SourceType(models.TextChoices):
    TELEGRAM = 'telegram', 'Telegram'
    SITE = 'site', 'Сайт / PWA'
    VK = 'vk', 'ВКонтакте'
    MAX = 'max', 'MAX'
