from celery import shared_task


@shared_task
def renewal_subscriptions_task() -> None:
    """
    Check if a subscriptions needs to be renewed.
    """
    from api.models.SubscriptionModel import SubscriptionModel

    enabled_subscriptions = SubscriptionModel.objects.filter(
        is_enabled=True, canceled_at=None
    )
    for subscription in enabled_subscriptions:
        subscription_handler.delay(subscription_id=subscription.id)


@shared_task
def subscription_handler(subscription_id: int) -> None:
    """
    Handles the actual subscription renewal process.
    """
    from api.services.SubscriptionService import SubscriptionService
    
    service = SubscriptionService()
    service.renew(subscription_id=subscription_id)
