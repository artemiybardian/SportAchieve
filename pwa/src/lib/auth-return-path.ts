/** Состояние маршрутизатора для возврата после входа с QR (/exercise/machine/…?gym=…) */
export type AuthReturnLocation = { pathname: string; search?: string };

export type LoginRouterState = { from?: AuthReturnLocation };

const STORAGE_KEY = 'sa_auth_return';

/** Куда не возвращаем после входа: профиль и формы auth ломают сценарий «вернуться к тренажёру». */
export function isRestorablePathAfterAuth(fullPath: string): boolean {
  const pathOnly = fullPath.split('?')[0] ?? '';
  if (!pathOnly.startsWith('/')) return false;
  if (pathOnly === '/login' || pathOnly === '/register') return false;
  if (pathOnly === '/user' || pathOnly.startsWith('/user/')) return false;
  return true;
}

export function getReturnFromState(state: unknown): AuthReturnLocation | undefined {
  if (!state || typeof state !== 'object') return undefined;
  const from = (state as LoginRouterState).from;
  if (!from?.pathname?.startsWith('/')) return undefined;
  return from;
}

export function buildReturnPath(from: AuthReturnLocation | undefined): string | null {
  if (!from?.pathname?.startsWith('/')) return null;
  return `${from.pathname}${from.search ?? ''}`;
}

/** Запоминаем URL до логина (дубль к state — на случай инкогнито / iOS). /user не храним — иначе после входа снова профиль, а не тренажёр. */
export function persistAuthReturnTarget(pathname: string, search: string): void {
  const full = `${pathname}${search || ''}`;
  if (!isRestorablePathAfterAuth(full)) return;
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ pathname, search: search || '' }),
    );
  } catch {
    /* ignore */
  }
}

export function peekAuthReturnFromStorage(): AuthReturnLocation | undefined {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return undefined;
    const o = JSON.parse(raw) as Partial<AuthReturnLocation>;
    if (typeof o.pathname === 'string' && o.pathname.startsWith('/')) {
      return { pathname: o.pathname, search: typeof o.search === 'string' ? o.search : '' };
    }
  } catch {
    /* ignore */
  }
  return undefined;
}

export function clearAuthReturnStorage(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * ?next= на /login — устойчив к потере location.state.
 * URLSearchParams.get уже отдаёт декодированное значение.
 */
export function parseNextQueryParam(next: string | null): string | null {
  if (!next) return null;
  if (!next.startsWith('/') || next.startsWith('//')) return null;
  if (next.includes('://')) return null;
  return next;
}

export function resolveReturnPathAfterAuth(args: {
  locationState: unknown;
  nextQuery: string | null;
}): string | null {
  const fromState = buildReturnPath(getReturnFromState(args.locationState));
  if (
    fromState &&
    fromState !== '/login' &&
    fromState !== '/register' &&
    isRestorablePathAfterAuth(fromState)
  ) {
    return fromState;
  }

  const fromNext = parseNextQueryParam(args.nextQuery);
  if (
    fromNext &&
    fromNext !== '/login' &&
    !fromNext.startsWith('/login?') &&
    isRestorablePathAfterAuth(fromNext)
  ) {
    return fromNext;
  }

  const fromStorage = buildReturnPath(peekAuthReturnFromStorage());
  if (
    fromStorage &&
    fromStorage !== '/login' &&
    fromStorage !== '/register' &&
    isRestorablePathAfterAuth(fromStorage)
  ) {
    return fromStorage;
  }

  return null;
}
