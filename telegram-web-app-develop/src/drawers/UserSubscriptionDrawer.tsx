import SubscriptionCard from "@/components/ui/SubscriptionCard/SubscriptionCard.tsx";
import {Button} from "@/components/ui/Button.tsx";
import {useUser} from "@/hooks/useUser.ts";
import {SubscriptionService} from "@/api";
import {useAppDispatch} from "@/store";
import {fetchSubscription} from "@/store/slices/userSlice.ts";
import {useState} from "react";
import {Text} from "@/components/ui/Typography.tsx";


export default function UserSubscriptionDrawer() {
    const { subscription } = useUser();
    const dispatch = useAppDispatch();
    const [isCancelling, setIsCancelling] = useState(false);

    const handleCancelSubscription = async () => {
        if (!subscription) return;
        
        setIsCancelling(true);
        try {
            await SubscriptionService.apiViewsDeleteSubscription(subscription.id);
            // Refresh subscription status after cancellation
            await dispatch(fetchSubscription());
        } catch (error) {
            console.error("Failed to cancel subscription:", error);
        } finally {
            setIsCancelling(false);
        }
    };

    const onCancelClick = () => {
        void handleCancelSubscription();
    };

    if (!subscription) {
        return (
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <p>У вас нет активной подписки</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{width: '100%'}}>
                <SubscriptionCard
                    isActive={subscription.is_valid}
                    daysLeft={subscription.type.access_duration_in_days}
                    name={subscription.type.name}
                    onClick={() => {}}
                />
            </div>
            {subscription.canceled_at && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                    <Text size="small" style={{ color: '#9191A5' }}>
                        Подписка отменена: {new Date(subscription.canceled_at).toLocaleDateString()}
                    </Text>
                </div>
            )}
            {subscription.is_enabled && !subscription.canceled_at && (
                <div style={{marginTop: '16px', display: 'flex', justifyContent: 'center', width: '100%'}}>
                    <Button 
                        variant="secondary" 
                        style={{ minWidth: "178px", padding: "22px 80px" }}
                        onClick={onCancelClick}
                        disabled={isCancelling}
                    >
                        {isCancelling ? "Отмена..." : "Отменить подписку"}
                    </Button>
                </div>
            )}
        </div>
    )

}
