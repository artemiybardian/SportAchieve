import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMaxStartParam } from './maxLaunchParams';
import { extractStaticMaxQrToken } from './maxQrToken';
import { clearMaxPaymentPendingRoute } from '@/lib/max-payment-pending-route';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * MAX: resolves QR deep link from start_param in initDataUnsafe.
 * The start_param contains a 24-hex HMAC token → GET /api/public/max-qr/{token}.
 */
export function MaxDeepLinkNavigator() {
  const navigate = useNavigate();
  const handledRef = useRef(false);
  const resolvingRef = useRef(false);

  useEffect(() => {
    if (handledRef.current || resolvingRef.current) return;

    const startParam = getMaxStartParam();
    if (!startParam) return;

    const token = extractStaticMaxQrToken(startParam);
    if (!token) return;

    const dedupKey = `sportachieve:max_tok:${token}`;
    if (sessionStorage.getItem(dedupKey)) {
      handledRef.current = true;
      return;
    }

    resolvingRef.current = true;

    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/api/public/max-qr/${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { trainer_uuid: string; gym_id: number };
        sessionStorage.setItem(dedupKey, '1');
        handledRef.current = true;
        clearMaxPaymentPendingRoute();
        navigate(`/exercise/machine/${data.trainer_uuid}?gym=${data.gym_id}`, { replace: true });
      } catch {
        /* network / CORS */
      } finally {
        resolvingRef.current = false;
      }
    })();
  }, [navigate]);

  return null;
}
