/** Последний просмотренный экран упражнений — чтобы после повторного онбординга вернуть на тренажёр / упражнение. */
const STORAGE_KEY = 'sa_last_browse_exercise';

export function rememberLastBrowsePath(pathname: string, search: string): void {
  if (!pathname.startsWith('/exercise/')) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pathname, search: search || '' }),
    );
  } catch {
    /* ignore */
  }
}

export function peekLastBrowsePath(): string | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const o = JSON.parse(raw) as { pathname?: string; search?: string };
    if (typeof o.pathname !== 'string' || !o.pathname.startsWith('/exercise/')) return null;
    const search = typeof o.search === 'string' ? o.search : '';
    return `${o.pathname}${search}`;
  } catch {
    return null;
  }
}

export function clearLastBrowsePath(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
