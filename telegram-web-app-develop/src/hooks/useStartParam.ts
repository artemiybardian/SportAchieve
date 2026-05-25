import { initData } from '@tma.js/sdk-react';
import { parseTgEquipmentDeepLink } from '@/lib/tgEquipmentDeepLink';

export function useStartParam() {
  const startParam = initData.startParam();
  const parsed = parseTgEquipmentDeepLink(startParam);

  return {
    params: parsed
      ? {
          equipment: parsed.machineId,
          ...(parsed.gymId ? { gym: parsed.gymId } : {}),
        }
      : ({} as Record<string, string>),
    gymId: parsed?.gymId,
    machineId: parsed?.machineId,
    raw: startParam,
  };
}
