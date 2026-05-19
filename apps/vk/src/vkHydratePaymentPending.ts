import bridge from '@vkontakte/vk-bridge';
import {
  mergeVkPaymentPendingFromHostEntry,
  registerVkPaymentPendingClearSideEffect,
  VK_PAYMENT_PENDING_LS_KEY,
} from '@/lib/vk-payment-pending-route';

/** Сброс облачной копии при clearVkPaymentPendingRoute (иначе гидрация вернёт старый путь). */
export function setupVkPaymentPendingHostSync(): void {
  registerVkPaymentPendingClearSideEffect(() => {
    void bridge
      .send('VKWebAppStorageSet', {
        key: VK_PAYMENT_PENDING_LS_KEY,
        value: '{}',
      })
      .catch(() => {});
  });
}

/** До первого рендера: подтянуть маршрут из VKWebAppStorage, если localStorage пуст/старее. */
export async function hydrateVkPaymentPendingFromHost(): Promise<void> {
  try {
    const res = await bridge.send('VKWebAppStorageGet', {
      keys: [VK_PAYMENT_PENDING_LS_KEY],
    });
    const row = res.keys.find((k) => k.key === VK_PAYMENT_PENDING_LS_KEY);
    if (row?.value) mergeVkPaymentPendingFromHostEntry(row.value);
  } catch {
    /* нет клиента VK */
  }
}
