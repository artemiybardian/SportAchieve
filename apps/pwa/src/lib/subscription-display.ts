import type { SubscriptionSchema } from '@/api/generated';

export type SubscriptionBadgeDisplay = {
  variant: 'success' | 'secondary';
  label: string;
};

/**
 * is_valid — есть доступ по последнему счёту (ещё не истёк срок).
 * canceled_at — пользователь отменил автопродление; доступ может оставаться до конца периода.
 */
export function getSubscriptionBadgeDisplay(sub: SubscriptionSchema): SubscriptionBadgeDisplay {
  if (!sub.is_valid) {
    return { variant: 'secondary', label: 'Неактивна' };
  }
  if (sub.canceled_at) {
    return { variant: 'secondary', label: 'Отменена' };
  }
  return { variant: 'success', label: 'Активна' };
}
