from unittest.mock import MagicMock, patch

from django.test import TestCase

from api.models.InvoiceModel import InvoiceModel
from api.models.InvoiceStatus import InvoiceStatus
from api.models.SubscriptionModel import SubscriptionModel
from api.models.SubscriptionScopeType import SubscriptionScopeType
from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.TelegramUserModel import TelegramUser
from api.models.UserPaymentMethodModel import UserPaymentMethodModel
from api.models.YooKasaWebhookLogModel import YooKasaWebhookLogModel
from api.services.SubscriptionService import SubscriptionService


class SubscriptionServiceTest(TestCase):
    def setUp(self) -> None:
        self.user: TelegramUser = TelegramUser.objects.create(username="testuser")
        self.sub_type: SubscriptionTypeModel = SubscriptionTypeModel.objects.create(
            name="Monthly",
            price=100.00,
            access_duration_in_days=30,
            scope_type=SubscriptionScopeType.ALL
        )
        self.subscription: SubscriptionModel = SubscriptionModel.objects.create(
            user=self.user,
            type=self.sub_type,
            is_enabled=True
        )
        self.service: SubscriptionService = SubscriptionService()

    @patch("api.services.SubscriptionService.YookasaClient")
    def test_renew_success(self, MockYookasaClient: MagicMock) -> None:
        # Setup mock instance
        mock_instance = MockYookasaClient.return_value
        mock_instance.make_invoice.return_value = {
            "status": "succeeded",
            "id": "payment_id_123",
        }

        # Setup payment method
        UserPaymentMethodModel.objects.create(
            id="pm_id_123", user=self.user, title="Visa 1234", type="bank_card"
        )

        service: SubscriptionService = SubscriptionService()

        # Execute and mock internal methods if needed (though we already mock Yookassa client)
        # To strictly follow "mock them in tests", let's mock some of the decomposed methods
        with patch.object(
            SubscriptionService, "_make_payment", wraps=service._make_payment
        ) as mock_make_payment:
            with patch.object(
                SubscriptionService,
                "_handle_successful_renewal",
                wraps=service._handle_successful_renewal,
            ) as mock_handle_success:
                service.renew(self.subscription.id)

                self.assertTrue(mock_make_payment.called)
                self.assertTrue(mock_handle_success.called)

        # Verify
        self.subscription.refresh_from_db()
        self.assertTrue(self.subscription.is_enabled)
        self.assertIsNotNone(self.subscription.renewed_at)

        invoice = InvoiceModel.objects.get(user=self.user, type=self.sub_type)
        self.assertEqual(invoice.status, InvoiceStatus.SUCCEEDED)
        
        log = YooKasaWebhookLogModel.objects.get(invoice=invoice)
        self.assertEqual(log.body["status"], "succeeded")

    @patch("api.services.SubscriptionService.YookasaClient")
    def test_renew_failed_payment(self, MockYookasaClient: MagicMock) -> None:
        # Setup mock
        mock_instance = MockYookasaClient.return_value
        mock_instance.make_invoice.return_value = {
            "status": "pending",  # Not 'succeeded'
            "id": "payment_id_456",
        }

        # Setup payment method
        UserPaymentMethodModel.objects.create(
            id="pm_id_456", user=self.user, title="Visa 4567", type="bank_card"
        )

        service: SubscriptionService = SubscriptionService()

        # Execute and mock internal methods
        with patch.object(
            SubscriptionService,
            "_handle_failed_renewal",
            wraps=service._handle_failed_renewal,
        ) as mock_handle_fail:
            service.renew(self.subscription.id)
            self.assertTrue(mock_handle_fail.called)

        # Verify
        self.subscription.refresh_from_db()
        self.assertFalse(self.subscription.is_enabled)
        
        invoice = InvoiceModel.objects.get(user=self.user, type=self.sub_type)
        self.assertEqual(invoice.status, InvoiceStatus.CANCELED)

    def test_renew_no_payment_method(self) -> None:
        # Execute
        with patch.object(
            SubscriptionService, "_get_user_payment_method", return_value=None
        ) as mock_get_pm:
            with patch.object(
                SubscriptionService,
                "_handle_failed_renewal",
                wraps=self.service._handle_failed_renewal,
            ) as mock_handle_fail:
                self.service.renew(self.subscription.id)
                self.assertTrue(mock_get_pm.called)
                self.assertTrue(mock_handle_fail.called)

        # Verify
        self.subscription.refresh_from_db()
        self.assertFalse(self.subscription.is_enabled)
        self.assertEqual(InvoiceModel.objects.count(), 0)

    def test_renew_subscription_not_found(self) -> None:
        # Execute (should not raise error)
        self.service.renew(9999)

        self.assertEqual(InvoiceModel.objects.count(), 0)

    def test_renew_subscription_already_disabled(self) -> None:
        self.subscription.is_enabled = False
        self.subscription.save()

        # Execute
        self.service.renew(self.subscription.id)

        # Verify
        self.assertEqual(InvoiceModel.objects.count(), 0)

    @patch("api.services.SubscriptionService.YookasaClient")
    def test_renew_client_returns_none(self, MockYookasaClient: MagicMock) -> None:
        # Setup mock
        mock_instance = MockYookasaClient.return_value
        mock_instance.make_invoice.return_value = None

        # Setup payment method
        UserPaymentMethodModel.objects.create(
            id="pm_id_789", user=self.user, title="Visa 7890", type="bank_card"
        )

        service: SubscriptionService = SubscriptionService()

        # Execute
        service.renew(self.subscription.id)

        # Verify
        self.subscription.refresh_from_db()
        self.assertFalse(self.subscription.is_enabled)

        invoice = InvoiceModel.objects.get(user=self.user, type=self.sub_type)
        self.assertEqual(invoice.status, InvoiceStatus.CANCELED)
