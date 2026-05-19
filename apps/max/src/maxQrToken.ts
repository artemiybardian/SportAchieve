/** 24 hex chars — HMAC token embedded in MAX QR deep link `?startapp={token}`. */
export function extractStaticMaxQrToken(raw: string): string | null {
  if (!raw) return null;
  const alone = raw.match(/^([a-f0-9]{24})$/i);
  if (alone) return alone[1].toLowerCase();
  return null;
}
