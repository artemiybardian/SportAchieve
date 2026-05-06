import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useSubscription, useCancelSubscription } from '@/features/user/api/use-user';
import { useToast } from '@/hooks/use-toast';
import { userFriendlyApiError } from '@/lib/utils';

interface UserSubscriptionSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function UserSubscriptionSheet({ open, onOpenChange }: UserSubscriptionSheetProps) {
  const { data: subscription } = useSubscription();
  const cancelSubscription = useCancelSubscription();
  const { toast } = useToast();

  const handleCancel = () => {
    if (!subscription) return;
    cancelSubscription.mutate(subscription.id, {
      onSuccess: () => {
        toast({ title: 'Подписка отменена' });
        onOpenChange(false);
      },
      onError: (err) => {
        toast({
          variant: 'destructive',
          title: 'Не получилось',
          description: userFriendlyApiError(err, 'Не удалось отменить подписку. Попробуйте позже.'),
        });
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="pb-10">
        <SheetHeader className="mb-4">
          <SheetTitle>Подписка</SheetTitle>
        </SheetHeader>
        {!subscription ? (
          <p className="text-center text-muted-foreground py-6">У вас нет активной подписки</p>
        ) : (
          <div className="space-y-4">
            <div className="border rounded-2xl p-4 flex justify-between items-center">
              <div>
                <p className="font-semibold">{subscription.type.name}</p>
                <Badge variant={subscription.is_valid ? 'success' : 'secondary'} className="mt-1">
                  {subscription.is_valid ? 'Активна' : 'Неактивна'}
                </Badge>
              </div>
              <p className="text-muted-foreground text-sm">{subscription.type.access_duration_in_days} дней</p>
            </div>
            {subscription.canceled_at && (
              <p className="text-xs text-center text-muted-foreground">
                Отменена: {new Date(subscription.canceled_at).toLocaleDateString('ru-RU')}
              </p>
            )}
            {subscription.is_enabled && !subscription.canceled_at && (
              <Button
                variant="outline"
                className="w-full h-12"
                onClick={handleCancel}
                disabled={cancelSubscription.isPending}
              >
                {cancelSubscription.isPending ? 'Отмена...' : 'Отменить подписку'}
              </Button>
            )}
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
