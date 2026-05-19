import { sanitizeInternalAppPath } from '@/lib/last-browse-path';

/** Должен совпадать с ключом в {@link packages/platform-vk} (VKWebAppStorage). */
export const VK_PAYMENT_PENDING_LS_KEY = 'sa_vk_payment_pending_route';

const MAX_AGE_MS = 45 * 60 * 1000;

/** Очистка VKWebAppStorage и т.п. (регистрируется из apps/vk). */
let paymentPendingClearSideEffect: (() => void) | undefined;

export function registerVkPaymentPendingClearSideEffect(fn: (() => void) | undefined): void {
  paymentPendingClearSideEffect = fn;
}

/** `/exercise/machine` без UUID — восстанавливать сюда не нужно. */
function isBareMachineScan(pathWithSearch: string): boolean {
  const pathOnly = pathWithSearch.split(/[?#]/)[0];
  return pathOnly === '/exercise/machine' || pathOnly === '/exercise/machine/';
}

/**
 * Перед переходом в ЮKassa (VK): localStorage + опционально VKWebAppStorage.
 */
export function setVkPaymentPendingRoute(pathWithSearch: string): string | null {
  const safe = sanitizeInternalAppPath(pathWithSearch);
  if (!safe || isBareMachineScan(safe)) return null;
  const payload = JSON.stringify({ path: safe, ts: Date.now() });
  try {
    localStorage.setItem(VK_PAYMENT_PENDING_LS_KEY, payload);
  } catch {
    /* ignore */
  }
  return safe;
}

/**
 * Значение из VKWebAppStorage → localStorage, если новее/валиднее локального.
 */
export function mergeVkPaymentPendingFromHostEntry(hostJson: string): void {
  let host: { path?: string; ts?: number };
  try {
    host = JSON.parse(hostJson) as { path?: string; ts?: number };
  } catch {
    return;
  }
  if (!host.path || typeof host.ts !== 'number') return;
  if (Date.now() - host.ts > MAX_AGE_MS) return;
  const safe = sanitizeInternalAppPath(host.path);
  if (!safe || isBareMachineScan(safe)) return;

  const localRaw = localStorage.getItem(VK_PAYMENT_PENDING_LS_KEY);
  if (localRaw) {
    try {
      const loc = JSON.parse(localRaw) as { ts?: number };
      if (typeof loc.ts === 'number' && loc.ts >= host.ts) return;
    } catch {
      /* перезаписываем */
    }
  }
  try {
    localStorage.setItem(
      VK_PAYMENT_PENDING_LS_KEY,
      JSON.stringify({ path: safe, ts: host.ts }),
    );
  } catch {
    /* ignore */
  }
}

export function peekVkPaymentPendingRoute(): string | null {
  try {
    const raw = localStorage.getItem(VK_PAYMENT_PENDING_LS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { path?: string; ts?: number };
    if (!o.path || typeof o.ts !== 'number') {
      localStorage.removeItem(VK_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    if (Date.now() - o.ts > MAX_AGE_MS) {
      localStorage.removeItem(VK_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    const safe = sanitizeInternalAppPath(o.path);
    if (!safe || isBareMachineScan(safe)) {
      localStorage.removeItem(VK_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    return safe;
  } catch {
    return null;
  }
}

export function clearVkPaymentPendingRoute(): void {
  try {
    localStorage.removeItem(VK_PAYMENT_PENDING_LS_KEY);
  } catch {
    /* ignore */
  }
  try {
    paymentPendingClearSideEffect?.();
  } catch {
    /* ignore */
  }
}

/** Сбрасываем «надо вернуть после оплаты», когда уже на экране конкретного тренажёра. */
export function maybeClearVkPaymentPendingForMachineRoute(pathname: string): void {
  if (/^\/exercise\/machine\/[^/]+/.test(pathname)) {
    clearVkPaymentPendingRoute();
  }
}
