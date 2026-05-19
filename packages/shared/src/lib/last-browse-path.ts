/** Последний просмотренный экран упражнений — чтобы после повторного онбординга вернуть на тренажёр / упражнение. */
const STORAGE_KEY = 'sa_last_browse_exercise';
/** Дублируем в localStorage: после оплаты сессия iframe может обнулиться, пока домен тот же. */
const PERSIST_KEY = 'sa_last_browse_exercise_persist';

function writeStorages(pathname: string, search: string): void {
  const payload = JSON.stringify({ pathname, search: search || '' });
  try {
    sessionStorage.setItem(STORAGE_KEY, payload);
  } catch {
    /* ignore */
  }
  try {
    localStorage.setItem(PERSIST_KEY, payload);
  } catch {
    /* ignore */
  }
}

/**
 * Безопасный внутренний путь для редиректа после оплаты (VK Mini App, MemoryRouter).
 */
export function sanitizeInternalAppPath(pathWithSearch: string): string | null {
  const s = pathWithSearch.trim();
  if (!s.startsWith('/') || s.includes('//')) return null;
  if (/^[a-z]+:/i.test(s.slice(1))) return null;
  const pathOnly = s.split('?')[0];
  const allowed =
    pathOnly.startsWith('/exercise/') ||
    pathOnly === '/user' ||
    pathOnly.startsWith('/user/') ||
    pathOnly === '/onboarding' ||
    pathOnly.startsWith('/onboarding/');
  if (!allowed) return null;
  return s;
}

export function rememberLastBrowsePath(pathname: string, search: string): void {
  if (!pathname.startsWith('/exercise/')) return;
  writeStorages(pathname, search);
}

export function peekLastBrowsePath(): string | null {
  try {
    const read = (raw: string | null): string | null => {
      if (!raw) return null;
      const o = JSON.parse(raw) as { pathname?: string; search?: string };
      if (typeof o.pathname !== 'string' || !o.pathname.startsWith('/exercise/')) return null;
      const search = typeof o.search === 'string' ? o.search : '';
      return `${o.pathname}${search}`;
    };
    const fromSession = read(sessionStorage.getItem(STORAGE_KEY));
    if (fromSession) return fromSession;
    return read(localStorage.getItem(PERSIST_KEY));
  } catch {
    return null;
  }
}

export function clearLastBrowsePath(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(PERSIST_KEY);
  } catch {
    /* ignore */
  }
}
