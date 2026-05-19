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
import { clearMaxPaymentPendingRoute } from '@/lib/max-payment-pending-route';

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
 * Listens for the MAX payment return hash fragment: `#payment=success` and optional `ret=` (MemoryRouter path).
 * After YooKassa redirects back via the return_url set in buildMaxSubscriptionReturnUrl,
 * this component detects it, navigates to the machine screen, refreshes subscriptions,
 * shows a confirmation toast, and cleans up the hash.
 */
export function MaxPaymentReturnListener() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    function handleHashChange() {
      const hash = window.location.hash;
      const match = hash.match(/[#&]payment=([\w-]+)/);
      if (!match) return;

      const dedupKey = `sportachieve:max_payment_return:${hash}`;
      const firstTime = !sessionStorage.getItem(dedupKey);
      if (firstTime) {
        sessionStorage.setItem(dedupKey, '1');
        void AnalyticsLogger.logPaymentSuccess('max-return');
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
        clearMaxPaymentPendingRoute();
      }

      history.replaceState(null, '', window.location.pathname + window.location.search);
    }

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [navigate, queryClient, toast]);

  return null;
}
