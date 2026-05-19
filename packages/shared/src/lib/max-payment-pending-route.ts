import { sanitizeInternalAppPath } from '@/lib/last-browse-path';

/** Должен совпадать с ключом в platform-max (localStorage). */
export const MAX_PAYMENT_PENDING_LS_KEY = 'sa_max_payment_pending_route';

const MAX_AGE_MS = 45 * 60 * 1000;

function isBareMachineScan(pathWithSearch: string): boolean {
  const pathOnly = pathWithSearch.split(/[?#]/)[0];
  return pathOnly === '/exercise/machine' || pathOnly === '/exercise/machine/';
}

export function setMaxPaymentPendingRoute(pathWithSearch: string): string | null {
  const safe = sanitizeInternalAppPath(pathWithSearch);
  if (!safe || isBareMachineScan(safe)) return null;
  const payload = JSON.stringify({ path: safe, ts: Date.now() });
  try {
    localStorage.setItem(MAX_PAYMENT_PENDING_LS_KEY, payload);
  } catch {
    /* ignore */
  }
  return safe;
}

export function peekMaxPaymentPendingRoute(): string | null {
  try {
    const raw = localStorage.getItem(MAX_PAYMENT_PENDING_LS_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { path?: string; ts?: number };
    if (!o.path || typeof o.ts !== 'number') {
      localStorage.removeItem(MAX_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    if (Date.now() - o.ts > MAX_AGE_MS) {
      localStorage.removeItem(MAX_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    const safe = sanitizeInternalAppPath(o.path);
    if (!safe || isBareMachineScan(safe)) {
      localStorage.removeItem(MAX_PAYMENT_PENDING_LS_KEY);
      return null;
    }
    return safe;
  } catch {
    return null;
  }
}

export function clearMaxPaymentPendingRoute(): void {
  try {
    localStorage.removeItem(MAX_PAYMENT_PENDING_LS_KEY);
  } catch {
    /* ignore */
  }
}

export function maybeClearMaxPaymentPendingForMachineRoute(pathname: string): void {
  if (/^\/exercise\/machine\/[^/]+/.test(pathname)) {
    clearMaxPaymentPendingRoute();
  }
}
