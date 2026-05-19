import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { queryKeys } from '@/lib/query-keys';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import {
  clearLastBrowsePath,
  peekLastBrowsePath,
  sanitizeInternalAppPath,
} from '@/lib/last-browse-path';
import { clearVkPaymentPendingRoute } from '@/lib/vk-payment-pending-route';

function parseRetFromHash(hash: string): string | null {
  const m = hash.match(/[#&]ret=([^&]+)/);
  if (!m) return null;
  try {
    return decodeURIComponent(m[1]);
  } catch {
    return null;
  }
}

/**
 * Listens for the VK payment return hash fragment: `#payment=…` и необязательный `ret=` (путь MemoryRouter).
 *
 * When YooKassa redirects back to the VK Mini App via
 * `https://vk.com/app{VK_APP_ID}#payment=success&ret=…`,
 * VK injects that hash into the WebView URL. This component detects it,
 * возвращает на экран тренажёра, refreshes subscriptions, shows a confirmation toast, and cleans up the hash.
 */
export function VkPaymentReturnListener() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      const match = hash.match(/[#&]payment=([\w-]+)/);
      if (!match) return;

      // Deduplicate — same hash fragment should not trigger toast twice per session.
      const dedupKey = `sportachieve:vk_payment_return:${hash}`;
      const firstTime = !sessionStorage.getItem(dedupKey);
      if (firstTime) {
        sessionStorage.setItem(dedupKey, '1');
        void AnalyticsLogger.logPaymentSuccess('vk-return');
        toast({
          title: 'Оплата прошла успешно',
          description:
            'Подписка скоро обновится. Если доступ не появился сразу, подождите пару секунд.',
        });
        void queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
        void queryClient.invalidateQueries({ queryKey: queryKeys.user });
      }

      const fromHash = parseRetFromHash(hash);
      const rawReturn =
        (fromHash ? sanitizeInternalAppPath(fromHash) : null) ??
        sanitizeInternalAppPath(peekLastBrowsePath() ?? '');
      if (rawReturn) {
        navigate(rawReturn, { replace: true });
        clearLastBrowsePath();
        clearVkPaymentPendingRoute();
      }

      // Remove the payment fragment so navigating back won't re-trigger.
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    // Check immediately on mount (VK may have already set the hash).
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate, queryClient, toast]);

  return null;
}
