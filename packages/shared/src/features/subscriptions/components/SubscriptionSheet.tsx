import { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useInvoiceTypes } from '@/features/exercises/api/use-exercises';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { useToast } from '@/hooks/use-toast';
import { SubscriptionService, InvoiceCreateSchema } from '@/api/generated';
import { buildSubscriptionReturnUrl, buildVkSubscriptionReturnUrl } from '@/lib/subscription-return-url';
import { userFriendlyApiError } from '@/lib/utils';
import { usePlatformOptional } from '@/providers/PlatformProvider';

interface SubscriptionSheetProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

export function SubscriptionSheet({ open, onOpenChange }: SubscriptionSheetProps) {
  const { data: invoiceTypes = [], isLoading } = useInvoiceTypes();
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(null);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const { toast } = useToast();
  const platform = usePlatformOptional();

  const selectedPlan = invoiceTypes.find((p) => p.id === selectedPlanId) ?? invoiceTypes[0];

  const handleSubscribe = async () => {
    if (!selectedPlan) return;
    void AnalyticsLogger.logSubscriptionClick(selectedPlan.id);
    void AnalyticsLogger.logPaymentAttempt(selectedPlan.id, InvoiceCreateSchema.payment_method.BANK_CARD);
    setCheckoutLoading(true);
    try {
      const isVk = platform?.name === 'vk';
      const response = await SubscriptionService.apiViewsSubscribe({
        subscription_type_id: selectedPlan.id,
        payment_method: InvoiceCreateSchema.payment_method.BANK_CARD,
        return_url: isVk
          ? buildVkSubscriptionReturnUrl()
          : buildSubscriptionReturnUrl(selectedPlan.id),
      });
      if (response.confirmation_url) {
        if (platform) {
          await platform.openExternalUrl(response.confirmation_url);
        } else {
          window.location.href = response.confirmation_url;
        }
        return;
      }
      toast({
        variant: 'destructive',
        title: 'Не удалось перейти к оплате',
        description: 'Попробуйте ещё раз или обратитесь в поддержку.',
      });
    } catch (error) {
      void AnalyticsLogger.logPaymentFailure(
        selectedPlan.id,
        error instanceof Error ? error.message : String(error)
      );
      toast({
        variant: 'destructive',
        title: 'Ошибка оплаты',
        description: userFriendlyApiError(error, 'Не удалось создать платёж. Попробуйте позже.'),
      });
    } finally {
      setCheckoutLoading(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto pb-10">
        <SheetHeader className="mb-4">
          <SheetTitle>Оплата</SheetTitle>
        </SheetHeader>
        {isLoading ? (
          <div className="flex justify-center py-10">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Получите расширенные техники, подробные разборы ошибок и программы прогрессии.
            </p>
            <div className="space-y-2">
              <h3 className="font-semibold">Что входит в платный доступ</h3>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Все упражнения тренажера</li>
                <li>Продвинутые техники выполнения</li>
                <li>Разбор частых ошибок</li>
                <li>Рекомендации по темпу и дыханию</li>
                <li>План прогрессии нагрузки</li>
              </ul>
            </div>
            <div className="space-y-2">
              {invoiceTypes.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setSelectedPlanId(plan.id)}
                  className={`w-full text-left border rounded-2xl p-4 transition-colors ${
                    (selectedPlanId ?? invoiceTypes[0]?.id) === plan.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-semibold">{plan.name}</span>
                    <span className="font-bold">{plan.price} ₽/мес</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Доступ ко всем упражнениям</p>
                </button>
              ))}
            </div>
            <Button
              onClick={() => {
                void handleSubscribe();
              }}
              className="w-full h-12"
              disabled={!selectedPlan || checkoutLoading}
            >
              {checkoutLoading ? 'Переход к оплате…' : 'Оформить подписку'}
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              Оплата банковской картой через ЮKassa. После оплаты вы вернётесь в приложение.
            </p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
