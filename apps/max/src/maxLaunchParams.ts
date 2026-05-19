/**
 * Extracts initData from window.WebApp (injected by the MAX CDN bridge script).
 * Returns null if the bridge is not available (e.g. opened in a regular browser).
 */
export function getRawMaxInitData(): string | null {
  try {
    const initData = window.WebApp?.initData;
    return initData || null;
  } catch {
    return null;
  }
}

/**
 * Returns the start_param from window.WebApp.initDataUnsafe (deep link payload).
 * Validated against allowed characters: A-Z, a-z, 0-9, _ and -.
 */
export function getMaxStartParam(): string | null {
  try {
    const param = window.WebApp?.initDataUnsafe?.start_param;
    if (!param) return null;
    // Enforce MAX-allowed chars per documentation.
    if (!/^[A-Za-z0-9_-]+$/.test(param)) return null;
    return param;
  } catch {
    return null;
  }
}
