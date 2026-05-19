import { sanitizeInternalAppPath } from '@/lib/last-browse-path';

export { MAX_PAYMENT_PENDING_LS_KEY } from '@/lib/max-payment-pending-route';

/** return_url для ЮKassa (PWA): тот же маршрут + маркеры для экрана «оплата успешна». */
export function buildSubscriptionReturnUrl(planId: number): string {
  const u = new URL(window.location.href);
  u.searchParams.set('payment', 'success');
  u.searchParams.set('plan', String(planId));
  return u.toString();
}

export type BuildVkSubscriptionReturnUrlOptions = {
  /** Текущий маршрут MemoryRouter — вернём пользователя на тот же экран (тренажёр и т.д.). */
  returnPath?: string;
};

/**
 * return_url для ЮKassa (VK Mini App).
 * После оплаты YooKassa редиректит пользователя обратно в VK Mini App.
 * Реальный статус платежа фиксируется webhook-ом; этот URL нужен только чтобы
 * VK вернул пользователя в приложение и триггернул обновление подписки.
 * Фрагмент `ret=` восстанавливается в {@link VkPaymentReturnListener}.
 */
export function buildVkSubscriptionReturnUrl(options?: BuildVkSubscriptionReturnUrlOptions): string {
  const vkAppId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VK_APP_ID) || '';
  const safeReturn = options?.returnPath
    ? sanitizeInternalAppPath(options.returnPath)
    : null;
  const ret = safeReturn ? `&ret=${encodeURIComponent(safeReturn)}` : '';
  return `https://vk.com/app${vkAppId}#payment=success${ret}`;
}

export type BuildMaxSubscriptionReturnUrlOptions = {
  /** Текущий маршрут MemoryRouter — вернём пользователя на тот же экран. */
  returnPath?: string;
};

/**
 * return_url для ЮKassa (MAX Mini App).
 * После оплаты YooKassa редиректит обратно на URL приложения MAX.
 * Фрагмент `ret=` восстанавливается в MaxPaymentReturnListener.
 */
export function buildMaxSubscriptionReturnUrl(options?: BuildMaxSubscriptionReturnUrlOptions): string {
  const appBase =
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_MAX_APP_BASE_URL) || window.location.origin;
  const safeReturn = options?.returnPath
    ? sanitizeInternalAppPath(options.returnPath)
    : null;
  const ret = safeReturn ? `&ret=${encodeURIComponent(safeReturn)}` : '';
  return `${appBase}/#payment=success${ret}`;
}
