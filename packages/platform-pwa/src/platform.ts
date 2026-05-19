export interface Platform {
  name: 'pwa' | 'vk' | 'max';
  init(): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  getTheme(): 'light' | 'dark';
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
  closeApp(): void;
  persistPrePaymentRoute?(sanitizedPathWithSearch: string): void;
}
// Note: this interface is structurally identical to the one in @sportachieve/shared/providers/PlatformProvider.
// TypeScript structural typing ensures they are compatible — no runtime dependency needed.

export function createPwaPlatform(): Platform {
  const listeners = new Set<(theme: 'light' | 'dark') => void>();

  const mediaQuery = typeof window !== 'undefined'
    ? window.matchMedia('(prefers-color-scheme: dark)')
    : null;

  if (mediaQuery) {
    mediaQuery.addEventListener('change', () => {
      const theme = mediaQuery.matches ? 'dark' : 'light';
      listeners.forEach((cb) => cb(theme));
    });
  }

  return {
    name: 'pwa',

    async init() {
      // Nothing platform-specific to initialise for PWA.
    },

    async openExternalUrl(url: string) {
      window.location.href = url;
    },

    getTheme() {
      if (typeof window === 'undefined') return 'light';
      // Respect the saved preference first (ThemeProvider stores it in localStorage)
      const stored = localStorage.getItem('sa_theme') as 'light' | 'dark' | null;
      if (stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    },

    onThemeChange(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    closeApp() {
      // Noop in browser PWA — there is no "close" concept.
    },
  };
}
