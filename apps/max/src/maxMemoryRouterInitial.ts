import { extractStaticMaxQrToken } from './maxQrToken';
import { peekMaxPaymentPendingRoute } from '@/lib/max-payment-pending-route';
import { getMaxStartParam } from './maxLaunchParams';

/**
 * First MemoryRouter entry after payment return or QR deep link.
 * Priority: static QR token in start_param → saved pending payment path → default.
 */
export function getMaxMemoryRouterInitialEntries(): string[] {
  const startParam = getMaxStartParam();
  if (startParam) {
    const token = extractStaticMaxQrToken(startParam);
    if (token) {
      // Token will be resolved asynchronously in MaxDeepLinkNavigator — start at root
      // and let the navigator redirect. We do not block the initial render here.
      return ['/'];
    }
  }

  const pending = peekMaxPaymentPendingRoute();
  if (pending) return [pending];

  return ['/'];
}
