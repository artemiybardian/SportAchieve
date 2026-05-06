/** return_url для ЮKassa: тот же маршрут + маркеры для экрана «оплата успешна». */
export function buildSubscriptionReturnUrl(planId: number): string {
  const u = new URL(window.location.href);
  u.searchParams.set('payment', 'success');
  u.searchParams.set('plan', String(planId));
  return u.toString();
}
