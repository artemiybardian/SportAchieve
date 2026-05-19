import { peekVkPaymentPendingRoute } from '@/lib/vk-payment-pending-route';
import { parseVkEquipmentDeepLink } from './vkEquipmentDeepLink';

function tryEquipmentPath(raw: string): string | null {
  const parsed = parseVkEquipmentDeepLink(raw);
  if (!parsed) return null;
  return parsed.gymId
    ? `/exercise/machine/${parsed.machineUuid}?gym=${parsed.gymId}`
    : `/exercise/machine/${parsed.machineUuid}`;
}

/**
 * Первый экран MemoryRouter после оплаты: без этого роутер поднимается с `/` и «Отсканируйте QR».
 * Приоритет: deep link в hash/href → сохранённый путь (localStorage после гидрации с VK).
 */
export function getVkMemoryRouterInitialEntries(): string[] {
  const fromEquipment =
    tryEquipmentPath(window.location.hash) || tryEquipmentPath(window.location.href);
  if (fromEquipment) return [fromEquipment];

  const pending = peekVkPaymentPendingRoute();
  if (pending) return [pending];

  return ['/'];
}
