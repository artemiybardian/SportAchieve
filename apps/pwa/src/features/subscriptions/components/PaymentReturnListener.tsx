import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/query-keys';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';

/** После редиректа из ЮKassa показывает тост и подтягивает актуальную подписку. */
export function PaymentReturnListener() {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('payment') !== 'success') return;

    const dedupe = `${location.pathname}?${location.search}`;
    const storageKey = `sportachieve:payment_return:${dedupe}`;
    if (sessionStorage.getItem(storageKey)) return;
    sessionStorage.setItem(storageKey, '1');

    const planRaw = params.get('plan');
    const planId = planRaw ? Number(planRaw) : NaN;
    void AnalyticsLogger.logPaymentSuccess(Number.isFinite(planId) ? planId : 'return');

    toast({
      title: 'Оплата прошла успешно',
      description: 'Подписка скоро обновится. Если доступ не появился сразу, обновите страницу через минуту.',
    });

    void queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    void queryClient.invalidateQueries({ queryKey: queryKeys.user });

    params.delete('payment');
    params.delete('plan');
    const nextSearch = params.toString();
    const next = `${location.pathname}${nextSearch ? `?${nextSearch}` : ''}`;
    navigate(next, { replace: true });
  }, [location.pathname, location.search, navigate, queryClient, toast]);

  return null;
}
