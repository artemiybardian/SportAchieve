import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/query-keys';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';

/**
 * Listens for the VK payment return hash fragment: `#payment=<invoice_id>`.
 *
 * When YooKassa redirects back to the VK Mini App via
 * `https://vk.com/app{VK_APP_ID}#payment=<invoice_id>`,
 * VK injects that hash into the WebView URL. This component detects it,
 * refreshes subscriptions, shows a confirmation toast, and cleans up the hash.
 */
export function VkPaymentReturnListener() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      const match = hash.match(/[#&]payment=([\w-]+)/);
      if (!match) return;

      // Deduplicate — same hash fragment should not trigger toast twice per session.
      const dedupKey = `sportachieve:vk_payment_return:${hash}`;
      if (sessionStorage.getItem(dedupKey)) return;
      sessionStorage.setItem(dedupKey, '1');

      void AnalyticsLogger.logPaymentSuccess('vk-return');

      toast({
        title: 'Оплата прошла успешно',
        description: 'Подписка скоро обновится. Если доступ не появился сразу, подождите пару секунд.',
      });

      void queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
      void queryClient.invalidateQueries({ queryKey: queryKeys.user });

      // Remove the payment fragment so navigating back won't re-trigger.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Check immediately on mount (VK may have already set the hash).
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [queryClient, toast]);

  return null;
}
