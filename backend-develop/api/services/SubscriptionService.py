import uuid
from typing import Optional

from django.conf import settings
from django.utils import timezone

from api.models.InvoiceModel import InvoiceModel
from api.models.InvoiceStatus import InvoiceStatus
from api.models.SubscriptionModel import SubscriptionModel
from api.models.TelegramUserModel import TelegramUser
from api.models.UserPaymentMethodModel import UserPaymentMethodModel
from api.models.YooKasaWebhookLogModel import YooKasaWebhookLogModel
from yookasa.YookasaClient import YookasaClient
from yookasa.types import PaymentResponseDict


class SubscriptionService:
    def __init__(self) -> None:
        self.client: YookasaClient = YookasaClient(
            shop_id=settings.YOOKASSA_SHOP_ID,
            secret_key=settings.YOOKASSA_SECRET_KEY
        )

    def renew(self, subscription_id: int) -> None:
        """
        Handles the actual subscription renewal process by decomposing it into steps.
        """
        subscription: Optional[SubscriptionModel] = self._get_active_subscription(subscription_id)
        if not subscription:
            return

        payment_method: Optional[UserPaymentMethodModel] = self._get_user_payment_method(subscription.user)
        if not payment_method:
            self._handle_failed_renewal(subscription)
            return

        idempotence_key: str = str(uuid.uuid4())
        invoice: InvoiceModel = self._create_pending_invoice(subscription, idempotence_key)

        payment_response: Optional[PaymentResponseDict] = self._make_payment(
            subscription, invoice, payment_method, idempotence_key
        )

        self._log_payment_response(invoice, payment_response)

        if payment_response and payment_response.get("status") == 'succeeded':
            self._handle_successful_renewal(subscription, invoice)
        else:
            self._handle_failed_renewal(subscription, invoice)

    def _get_active_subscription(self, subscription_id: int) -> Optional[SubscriptionModel]:
        try:
            return SubscriptionModel.objects.get(id=subscription_id, is_enabled=True, canceled_at=None)
        except SubscriptionModel.DoesNotExist:
            return None

    def _get_user_payment_method(self, user: TelegramUser) -> Optional[UserPaymentMethodModel]:
        return UserPaymentMethodModel.objects.filter(user=user).order_by('-created_at').first()

    def _create_pending_invoice(self, subscription: SubscriptionModel, idempotence_key: str) -> InvoiceModel:
        return InvoiceModel.objects.create(
            user=subscription.user,
            type=subscription.type,
            description=f"Auto-renewal for {subscription.type.name}",
            idempotence_key=idempotence_key,
            status=InvoiceStatus.PENDING
        )

    def _make_payment(
        self,
        subscription: SubscriptionModel,
        invoice: InvoiceModel,
        payment_method: UserPaymentMethodModel,
        idempotence_key: str
    ) -> Optional[PaymentResponseDict]:
        return self.client.make_invoice(
            amount=float(subscription.type.price),
            invoice_id=invoice.id,
            description=invoice.description,
            return_url="https://t.me/your_bot",  # TODO replace with bot name
            payment_method_id=payment_method.id,
            idempotence_key=idempotence_key
        )

    def _log_payment_response(self, invoice: InvoiceModel, payment_response: Optional[PaymentResponseDict]) -> None:
        YooKasaWebhookLogModel.objects.create(
            invoice=invoice,
            body=payment_response or {}
        )

    def _handle_successful_renewal(self, subscription: SubscriptionModel, invoice: InvoiceModel) -> None:
        invoice.status = InvoiceStatus.SUCCEEDED
        invoice.save()
        subscription.renewed_at = timezone.now()
        subscription.save()

    def _handle_failed_renewal(self, subscription: SubscriptionModel, invoice: Optional[InvoiceModel] = None) -> None:
        if invoice:
            invoice.status = InvoiceStatus.CANCELED
            invoice.save()

        subscription.is_enabled = False
        subscription.save()
