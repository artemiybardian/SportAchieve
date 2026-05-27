/** Формат deep-link из админки: `equipment_<uuid>-gym_<id>` (в hash или в location из VK Bridge). */
const EQUIPMENT_RE =
  /equipment_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;

export type VkEquipmentDeepLink = {
  machineUuid: string;
  gymId?: string;
};

export function parseVkEquipmentDeepLink(raw: string): VkEquipmentDeepLink | null {
  if (!raw) return null;
  const equipmentMatch = raw.match(EQUIPMENT_RE);
  if (!equipmentMatch) return null;
  const gymMatch = raw.match(/gym_(\d+)/);
  return {
    machineUuid: equipmentMatch[1],
    gymId: gymMatch ? gymMatch[1] : undefined,
  };
}

/** 24 hex — символы из HMAC в `vk.com/app…#token` или `app…_-group#token`. */
export function extractStaticVkQrToken(raw: string): string | null {
  if (!raw) return null;
  const withHash = raw.match(/#([a-f0-9]{24})\b/i);
  if (withHash) return withHash[1].toLowerCase();
  const alone = raw.match(/^([a-f0-9]{24})$/i);
  if (alone) return alone[1].toLowerCase();
  return null;
}
