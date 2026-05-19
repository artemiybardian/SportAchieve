import { useEffect, useLayoutEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import bridge from '@vkontakte/vk-bridge';
import { sanitizeInternalAppPath } from '@/lib/last-browse-path';
import {
  clearVkPaymentPendingRoute,
  peekVkPaymentPendingRoute,
} from '@/lib/vk-payment-pending-route';
import { extractStaticVkQrToken, parseVkEquipmentDeepLink } from './vkEquipmentDeepLink';

type BridgeListener = Parameters<typeof bridge.subscribe>[0];

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

/**
 * VK: открытие с `vk.com/app…#…` — hash и legacy-payload часто не в iframe.
 * 1) Legacy: `equipment_<uuid>-gym_<id>`
 * 2) Статичный токен 24 hex → `GET /api/public/vk-qr/{token}` (тот же QR, пока те же тренажёр и зал).
 */
export function VkDeepLinkNavigator() {
  const navigate = useNavigate();
  const location = useLocation();
  const handledRef = useRef(false);
  const resolvingRef = useRef(false);

  /** Синхронно: equipment в hash/href и возврат с ЮKassa (pending в localStorage). Раньше useEffect QR, иначе pending перебивал deep link. */
  useLayoutEffect(() => {
    const tryEquipmentDeepLinkSync = (raw: string | undefined | null): boolean => {
      if (!raw || handledRef.current) return false;
      const parsed = parseVkEquipmentDeepLink(raw);
      if (!parsed) return false;

      const dedupKey = `sportachieve:vk_deeplink:${parsed.machineUuid}:${parsed.gymId ?? ''}`;
      if (sessionStorage.getItem(dedupKey)) {
        handledRef.current = true;
        return true;
      }
      sessionStorage.setItem(dedupKey, '1');
      handledRef.current = true;

      const target = parsed.gymId
        ? `/exercise/machine/${parsed.machineUuid}?gym=${parsed.gymId}`
        : `/exercise/machine/${parsed.machineUuid}`;
      clearVkPaymentPendingRoute();
      navigate(target, { replace: true });
      history.replaceState(null, '', window.location.pathname + window.location.search);
      return true;
    };

    if (tryEquipmentDeepLinkSync(window.location.hash)) return;
    if (tryEquipmentDeepLinkSync(window.location.href)) return;

    const isScan =
      location.pathname === '/exercise/machine' || location.pathname === '/exercise/machine/';
    if (!isScan || handledRef.current) return;

    const pending = peekVkPaymentPendingRoute();
    if (!pending) return;
    const safe = sanitizeInternalAppPath(pending);
    if (!safe) {
      clearVkPaymentPendingRoute();
      return;
    }
    clearVkPaymentPendingRoute();
    navigate(safe, { replace: true });
  }, [location.pathname, navigate]);

  useEffect(() => {
    const tryEquipmentDeepLink = (raw: string | undefined | null): boolean => {
      if (!raw || handledRef.current) return false;
      const parsed = parseVkEquipmentDeepLink(raw);
      if (!parsed) return false;

      const dedupKey = `sportachieve:vk_deeplink:${parsed.machineUuid}:${parsed.gymId ?? ''}`;
      if (sessionStorage.getItem(dedupKey)) {
        handledRef.current = true;
        return true;
      }
      sessionStorage.setItem(dedupKey, '1');
      handledRef.current = true;

      const target = parsed.gymId
        ? `/exercise/machine/${parsed.machineUuid}?gym=${parsed.gymId}`
        : `/exercise/machine/${parsed.machineUuid}`;
      clearVkPaymentPendingRoute();
      navigate(target, { replace: true });
      history.replaceState(null, '', window.location.pathname + window.location.search);
      return true;
    };

    const tryResolveVkStaticToken = async (raw: string | undefined | null): Promise<void> => {
      if (!raw || handledRef.current || resolvingRef.current) return;
      const token = extractStaticVkQrToken(raw);
      if (!token) return;

      const dedupKey = `sportachieve:vk_tok:${token}`;
      if (sessionStorage.getItem(dedupKey)) {
        handledRef.current = true;
        return;
      }

      resolvingRef.current = true;
      try {
        const res = await fetch(`${API_BASE}/api/public/vk-qr/${encodeURIComponent(token)}`);
        if (!res.ok) return;
        const data = (await res.json()) as { trainer_uuid: string; gym_id: number };
        sessionStorage.setItem(dedupKey, '1');
        handledRef.current = true;
        clearVkPaymentPendingRoute();
        navigate(`/exercise/machine/${data.trainer_uuid}?gym=${data.gym_id}`, { replace: true });
        history.replaceState(null, '', window.location.pathname + window.location.search);
      } catch {
        /* сеть / CORS */
      } finally {
        resolvingRef.current = false;
      }
    };

    const processRaw = (raw: string | undefined | null) => {
      if (tryEquipmentDeepLink(raw)) return;
      void tryResolveVkStaticToken(raw);
    };

    processRaw(window.location.hash);
    processRaw(window.location.href);

    let pollTicks = 0;
    const pollId = window.setInterval(() => {
      processRaw(window.location.hash);
      pollTicks += 1;
      if (handledRef.current || pollTicks > 40) {
        window.clearInterval(pollId);
      }
    }, 150);

    const onHashChange = () => {
      processRaw(window.location.hash);
    };
    window.addEventListener('hashchange', onHashChange);

    const handler: BridgeListener = (event) => {
      const t = event.detail.type;
      if (t === 'VKWebAppLocationChanged' || t === 'VKWebAppChangeFragment') {
        const loc = (event.detail.data as { location?: string })?.location;
        if (loc) {
          processRaw(loc.startsWith('#') ? loc : `#${loc}`);
          processRaw(loc);
        }
      }
      try {
        tryEquipmentDeepLink(JSON.stringify(event.detail));
      } catch {
        /* ignore */
      }
    };

    bridge.subscribe(handler);

    void bridge
      .send('VKWebAppGetLaunchParams')
      .then((lp) => {
        try {
          tryEquipmentDeepLink(JSON.stringify(lp));
        } catch {
          /* ignore */
        }
      })
      .catch(() => {});

    return () => {
      window.clearInterval(pollId);
      window.removeEventListener('hashchange', onHashChange);
      bridge.unsubscribe(handler);
    };
  }, [location.pathname, navigate]);

  return null;
}
