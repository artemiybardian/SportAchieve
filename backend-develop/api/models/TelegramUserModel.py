from django.contrib.auth.models import AbstractUser
from django.db import models

from api.models.SourceType import SourceType


class TelegramUser(AbstractUser):
    profile_photo = models.URLField(max_length=1024, blank=True, null=True, verbose_name='Фото профиля')
    is_onboarding_complete = models.BooleanField(default=False, verbose_name='Онбординг пройден')
    vk_id = models.BigIntegerField(
        unique=True, null=True, blank=True, db_index=True, verbose_name='VK ID'
    )
    source = models.CharField(
        max_length=20,
        choices=SourceType.choices,
        default=SourceType.TELEGRAM,
        verbose_name='Источник',
    )

    groups = models.ManyToManyField(
        'auth.Group',
        related_name='telegram_user_set',
        blank=True,
        verbose_name='Группы',
        help_text='Группы, к которым принадлежит пользователь.',
    )
    user_permissions = models.ManyToManyField(
        'auth.Permission',
        related_name='telegram_user_set',
        blank=True,
        verbose_name='Права пользователя',
        help_text='Индивидуальные права доступа для этого пользователя.',
    )

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'
