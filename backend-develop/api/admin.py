import os

from django.contrib import admin
from django.utils.safestring import mark_safe
import qrcode
import base64
from io import BytesIO

from api.models.ExerciseInstructionModel import ExerciseInstructionModel
from api.models.SubscriptionInvoiceModel import SubscriptionInvoiceModel
from api.models.SubscriptionModel import SubscriptionModel
from api.models.TelegramUserModel import TelegramUser
from api.models.EventLogModel import EventLogModel
from api.models.EventTypeModel import EventTypeModel
from api.models.ExerciseModel import ExerciseModel
from api.models.ExerciseMuscleRelation import ExerciseMuscleRelation
from api.models.GYMLocationModel import GYMLocationModel
from api.models.InvoiceModel import InvoiceModel
from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.SubscriptionTypeScopeModel import SubscriptionTypeScopeModel
from api.models.MuscleModel import MuscleModel
from api.models.QRCodeModel import QRCodeModel
from api.models.TrainerExerciseRelation import TrainerExerciseRelation
from api.models.TrainerModel import TrainerModel
from api.models.UserPaymentMethodModel import UserPaymentMethodModel
from api.models.YooKasaWebhookLogModel import YooKasaWebhookLogModel

admin.site.site_header = 'SportAchieve — Управление'
admin.site.site_title = 'SportAchieve'
admin.site.index_title = 'Панель управления'

# Register your models here.
@admin.register(EventLogModel)
class EventLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'event_type__name', 'user', 'created_at')
    list_filter = ('event_type__name',)
    search_fields = ('user__username', 'event_type__name')
    date_hierarchy = "created_at"
    readonly_fields = ('created_at', 'updated_at')
    

@admin.register(EventTypeModel)
class EventTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'created_at')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    

class ExerciseMuscleInline(admin.TabularInline):
    model = ExerciseMuscleRelation
    extra = 0
    readonly_fields = ("created_at",)


class ExerciseInstructionInline(admin.StackedInline):
    model = ExerciseInstructionModel
    extra = 0
    readonly_fields = ("type", "video_url", "instruction", "created_at", "updated_at")


@admin.register(ExerciseModel)
class ExerciseAdmin(admin.ModelAdmin):
    list_display = ('name', 'access_type', 'created_at')
    list_filter = ('access_type',)
    search_fields = ('name', 'instruction')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ExerciseMuscleInline, ExerciseInstructionInline]
    

class YooKasaWebhookLogInline(admin.TabularInline):
    model = YooKasaWebhookLogModel
    extra = 0
    readonly_fields = ("created_at", "body")
    can_delete = False


@admin.register(InvoiceModel)
class InvoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'type', 'status', 'updated_at')
    list_filter = ('status', 'type')
    search_fields = ('idempotence_key', 'user__username', 'description')
    readonly_fields = ('created_at', 'updated_at')
    date_hierarchy = "created_at"
    inlines = [YooKasaWebhookLogInline]


class InvoiceTypeScopeInline(admin.TabularInline):
    model = SubscriptionTypeScopeModel
    extra = 0
    readonly_fields = ("created_at",)

@admin.register(SubscriptionTypeModel)
class InvoiceTypeAdmin(admin.ModelAdmin):
    list_display = ('name', 'access_duration_in_days', 'scope_type')
    search_fields = ('name',)
    inlines = [InvoiceTypeScopeInline]


@admin.register(SubscriptionTypeScopeModel)
class InvoiceTypeScopeAdmin(admin.ModelAdmin):
    list_display = ("id", "type", "exercise")
    search_fields = ('type__id',)
    list_filter = ("exercise",)
    readonly_fields = ('created_at',)
    

@admin.register(MuscleModel)
class MuscleAdmin(admin.ModelAdmin):
    list_display = ('id', 'name')
    search_fields = ('name',)
    readonly_fields = ('created_at', 'updated_at')
    inlines = [ExerciseMuscleInline]


@admin.register(TrainerExerciseRelation)
class TrainerExerciseRelationAdmin(admin.ModelAdmin):
    list_display = ('id', 'trainer__name', 'exercise__name', 'show')
    list_filter = ('show', 'created_at')
    search_fields = ('trainer__name', 'exercise__name')
    readonly_fields = ('created_at',)


@admin.register(ExerciseMuscleRelation)
class ExerciseMuscleRelationAdmin(admin.ModelAdmin):
    list_display = ('id', 'exercise__name', 'muscle__name')
    search_fields = ('exercise__name', 'muscle__name')
    list_filter = ('exercise__name', 'muscle__name')
    readonly_fields = ('created_at',)


class TrainerExerciseInline(admin.TabularInline):
    model = TrainerExerciseRelation
    extra = 0
    readonly_fields = ("created_at",)


@admin.register(TrainerModel)
class TrainerAdmin(admin.ModelAdmin):
    list_display = ('name', 'description')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    inlines = [TrainerExerciseInline]


@admin.register(YooKasaWebhookLogModel)
class YooKasaWebhookLogAdmin(admin.ModelAdmin):
    list_display = ('id', 'invoice', 'body')
    search_fields = ('invoice__idempotence_key', 'invoice__id')
    readonly_fields = ('created_at',)
    date_hierarchy = "created_at"

@admin.register(QRCodeModel)
class QRCodeAdmin(admin.ModelAdmin):
    list_display = ["location", "qrcode_image", "trainer", "source", "created_at"]
    search_fields = ["id"]
    list_filter = ["source"]
    readonly_fields = ('created_at', 'updated_at', 'qrcode_image')

    def get_readonly_fields(self, request, obj=None):
        """Превью QR только для сохранённой записи — на «добавить» не вызываем генерацию."""
        base = ('created_at', 'updated_at')
        if obj is not None and obj.pk:
            return base + ('qrcode_image',)
        return base

    def qrcode_image(self, obj):
        if obj is None or not obj.pk:
            return ""
        if not obj.trainer_id or not obj.location_id:
            return ""

        from api.models.SourceType import SourceType
        from django.conf import settings as django_settings

        try:
            trainer = obj.trainer
            loc_id = obj.location_id
            if trainer is None:
                return ""
            tid = getattr(trainer, "uuid", None)
            if tid is None:
                return mark_safe('<span style="color:#888">У тренажёра нет UUID (сохраните тренажёр после миграции).</span>')

            if obj.source == SourceType.SITE:
                pwa_base = getattr(django_settings, 'PWA_BASE_URL', 'http://localhost:3160')
                qr_data = f"{pwa_base.rstrip('/')}/exercise/machine/{tid}?gym={loc_id}"
            elif obj.source == SourceType.VK:
                # Клиент ВК + статичный токен в hash: не меняется, пока те же uuid тренажёра и зал.
                # Разбор на бэкенде: GET /api/public/vk-qr/{token}
                from api.vk_qr_token import compute_vk_qr_token
                vk_app_id = getattr(django_settings, 'VK_APP_ID', '') or os.environ.get('VK_APP_ID', '')
                vk_token = compute_vk_qr_token(str(tid), int(loc_id))
                qr_data = f"https://vk.com/app{vk_app_id}#{vk_token}"
            elif obj.source == SourceType.MAX:
                # MAX Mini App: глубокая ссылка со статичным токеном в start_param.
                # Разбор на бэкенде: GET /api/public/max-qr/{token}
                from api.max_qr_token import compute_max_qr_token
                max_bot_username = getattr(django_settings, 'MAX_BOT_USERNAME', '') or os.environ.get('MAX_BOT_USERNAME', '')
                max_token = compute_max_qr_token(str(tid), int(loc_id))
                qr_data = f"https://max.ru/{max_bot_username}?startapp={max_token}"
            else:
                telegram_bot_username = os.environ.get("TELEGRAM_BOT_USERNAME", "")
                qr_data = (
                    f"https://t.me/{telegram_bot_username}?startapp="
                    f"equipment_{obj.trainer.uuid}-gym_{obj.location_id}"
                )

            qr = qrcode.QRCode(
                version=1,
                error_correction=qrcode.constants.ERROR_CORRECT_L,
                box_size=10,
                border=4,
            )
            qr.add_data(qr_data)
            qr.make(fit=True)

            img = qr.make_image(fill_color="black", back_color="white")
            buffered = BytesIO()
            img.save(buffered, format="PNG")
            img_str = base64.b64encode(buffered.getvalue()).decode()

            return mark_safe(f'<img src="data:image/png;base64,{img_str}" width="150" height="150" />')
        except Exception as e:  # pragma: no cover — не ронять админку из‑за QR
            return mark_safe(f'<span style="color:#c00">Ошибка превью: {str(e)}</span>')

    qrcode_image.short_description = "QR-код"

@admin.register(GYMLocationModel)
class GYMLocationAdmin(admin.ModelAdmin):
    list_display = ["address"]


@admin.register(TelegramUser)
class TelegramUserAdmin(admin.ModelAdmin):
    list_display = ["username", "first_name", "last_name", "source", "is_staff", "is_active", "date_joined", "last_login"]
    search_fields = ["username", "first_name", "last_name", "email"]
    list_filter = ["source", "is_staff", "is_active", "is_onboarding_complete"]
    readonly_fields = ["date_joined", "username", "first_name", "last_name", "email", "groups", "user_permissions", "last_login", "profile_photo"]


@admin.register(UserPaymentMethodModel)
class UserPaymentMethodAdmin(admin.ModelAdmin):
    list_display = ["id", "user", "title", "updated_at"]
    search_fields = ["id", "title", "user__username"]
    readonly_fields = ["id", "user", "title", "card_info", "type", 'created_at', 'updated_at']
    

class SubscriptionInvoiceInline(admin.TabularInline):
    model = SubscriptionInvoiceModel
    extra = 0
    readonly_fields = ("invoice", "created_at")


@admin.register(SubscriptionModel)
class SubscriptionAdmin(admin.ModelAdmin):
    list_display = ["user", "type", "is_enabled", "is_valid", "renewed_at", "canceled_at", "created_at"]
    search_fields = ["user"]
    list_filter = ["type", "is_enabled"]
    readonly_fields = ['created_at', 'updated_at', 'renewed_at', "canceled_at"]
    inlines = [SubscriptionInvoiceInline]

@admin.register(SubscriptionInvoiceModel)
class SubscriptionInvoiceAdmin(admin.ModelAdmin):
    list_display = ["subscription", "invoice", "created_at"]
    list_filter = ["subscription__type"]
    readonly_fields = ['created_at']

@admin.register(ExerciseInstructionModel)
class ExerciseInstructionAdmin(admin.ModelAdmin):
    list_display = ["exercise", "type", "updated_at"]
    list_filter = ["type"]
    readonly_fields = ['created_at', 'updated_at']


# Hide Celery internals and Auth Groups from admin — not needed for daily use
def _unregister(*models):
    for m in models:
        try:
            admin.site.unregister(m)
        except admin.sites.NotRegistered:
            pass


try:
    from django_celery_results.models import GroupResult, TaskResult
    _unregister(GroupResult, TaskResult)
except ImportError:
    pass

try:
    from django_celery_beat.models import (
        CrontabSchedule, SolarSchedule, ClockedSchedule,
        IntervalSchedule, PeriodicTask,
    )
    _unregister(CrontabSchedule, SolarSchedule, ClockedSchedule, IntervalSchedule, PeriodicTask)
except ImportError:
    pass

from django.contrib.auth.models import Group
_unregister(Group)
