/** Формат deep-link из админки: `equipment_<uuid|id>-gym_<id>`. */
const EQUIPMENT_UUID_RE =
  /equipment_([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})/;
const EQUIPMENT_ID_RE = /equipment_(\d+)/;
const GYM_RE = /gym_(\d+)/;

export type TgEquipmentDeepLink = {
  machineId: string;
  gymId?: string;
};

export function parseTgEquipmentDeepLink(raw: string | null | undefined): TgEquipmentDeepLink | null {
  if (!raw) return null;
  const uuidMatch = raw.match(EQUIPMENT_UUID_RE);
  const idMatch = raw.match(EQUIPMENT_ID_RE);
  const machineId = uuidMatch?.[1] ?? idMatch?.[1];
  if (!machineId) return null;
  const gymMatch = raw.match(GYM_RE);
  return {
    machineId,
    gymId: gymMatch?.[1],
  };
}
