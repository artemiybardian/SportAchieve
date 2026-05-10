/**
 * VK passes signed launch params on the iframe URL (query string; rarely in hash).
 * Returns the raw string expected by POST /api/token/vk (no leading "?").
 */
export function getRawVkLaunchParams(): string {
  const fromSearch = window.location.search.replace(/^\?/, '');
  if (fromSearch.includes('sign=') && fromSearch.includes('vk_')) {
    return fromSearch;
  }

  const hash = window.location.hash.replace(/^#/, '');
  if (hash.startsWith('?')) {
    const h = hash.slice(1);
    if (h.includes('sign=') && h.includes('vk_')) return h;
  }
  if (hash.includes('sign=') && hash.includes('vk_')) {
    const q = hash.includes('?') ? hash.split('?').slice(1).join('?') : hash;
    if (q.includes('sign=')) return q;
  }

  return fromSearch;
}

/** True when the URL looks like a real VK Mini App load (not a plain browser open). */
export function urlLooksLikeVkMiniApp(): boolean {
  const raw = `${window.location.search}${window.location.hash}`;
  return raw.includes('sign=') && /vk_app_id|vk_user_id/.test(raw);
}
