/** return_url для ЮKassa (PWA): тот же маршрут + маркеры для экрана «оплата успешна». */
export function buildSubscriptionReturnUrl(planId: number): string {
  const u = new URL(window.location.href);
  u.searchParams.set('payment', 'success');
  u.searchParams.set('plan', String(planId));
  return u.toString();
}

/**
 * return_url для ЮKassa (VK Mini App).
 * После оплаты YooKassa редиректит пользователя обратно в VK Mini App.
 * Реальный статус платежа фиксируется webhook-ом; этот URL нужен только чтобы
 * VK вернул пользователя в приложение и триггернул обновление подписки.
 */
export function buildVkSubscriptionReturnUrl(): string {
  const vkAppId = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_VK_APP_ID) || '';
  return `https://vk.com/app${vkAppId}#payment=success`;
}
