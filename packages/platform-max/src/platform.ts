import type { Platform } from './types';

export type { Platform };

const MAX_PAYMENT_PENDING_LS_KEY = 'sa_max_payment_pending_route';

declare global {
  interface Window {
    WebApp?: {
      initData: string;
      initDataUnsafe: {
        query_id?: string;
        auth_date?: number;
        hash?: string;
        start_param?: string;
        user?: {
          id: number;
          first_name: string;
          last_name: string;
          username?: string | null;
          language_code?: string;
          photo_url?: string | null;
        };
      };
      platform?: string;
      version?: string;
      close?: () => void;
    };
  }
}

export function createMaxPlatform(): Platform {
  const themeListeners = new Set<(theme: 'light' | 'dark') => void>();

  // MAX does not provide a theme API — use system preference and observe changes.
  const mediaQuery =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-color-scheme: dark)')
      : null;

  function getSystemTheme(): 'light' | 'dark' {
    return mediaQuery?.matches ? 'dark' : 'light';
  }

  if (mediaQuery) {
    mediaQuery.addEventListener('change', (e) => {
      const theme: 'light' | 'dark' = e.matches ? 'dark' : 'light';
      applyTheme(theme);
      themeListeners.forEach((cb) => cb(theme));
    });
  }

  return {
    name: 'max',

    async init() {
      // window.WebApp is injected by the MAX CDN script before this runs.
      // No explicit initialisation call needed — the object is pre-loaded.
      applyTheme(getSystemTheme());
    },

    async openExternalUrl(url: string) {
      window.open(url, '_blank');
    },

    getTheme() {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    },

    onThemeChange(callback) {
      themeListeners.add(callback);
      return () => themeListeners.delete(callback);
    },

    closeApp() {
      try {
        window.WebApp?.close?.();
      } catch {
        /* ignore */
      }
    },

    persistPrePaymentRoute(sanitizedPathWithSearch: string) {
      if (!sanitizedPathWithSearch.startsWith('/')) return;
      try {
        const payload = JSON.stringify({ path: sanitizedPathWithSearch, ts: Date.now() });
        localStorage.setItem(MAX_PAYMENT_PENDING_LS_KEY, payload);
      } catch {
        /* ignore */
      }
    },
  };
}

function applyTheme(theme: 'light' | 'dark') {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
}
