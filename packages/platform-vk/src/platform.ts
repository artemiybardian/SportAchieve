import bridge from '@vkontakte/vk-bridge';
import type { Platform } from './types';

export type { Platform };

const OUTSIDE_VK_INIT_MS = 4000;
const INSIDE_VK_INIT_MAX_MS = 60000;

function urlLooksLikeVkMiniApp(): boolean {
  if (typeof window === 'undefined') return false;
  const raw = `${window.location.search}${window.location.hash}`;
  return raw.includes('sign=') && /vk_app_id|vk_user_id/.test(raw);
}

export function createVkPlatform(): Platform {
  const themeListeners = new Set<(theme: 'light' | 'dark') => void>();

  // Listen for VK theme / config updates and notify subscribers.
  bridge.subscribe((event) => {
    if (
      event.detail.type === 'VKWebAppUpdateConfig' ||
      event.detail.type === 'VKWebAppViewRestore'
    ) {
      const data = event.detail.data as { scheme?: string };
      const isDark =
        data?.scheme === 'space_gray' ||
        data?.scheme === 'vkcom_dark';
      const theme: 'light' | 'dark' = isDark ? 'dark' : 'light';
      applyTheme(theme);
      themeListeners.forEach((cb) => cb(theme));
    }
  });

  return {
    name: 'vk',

    async init() {
      const inVk = urlLooksLikeVkMiniApp();
      const shortDeadline = OUTSIDE_VK_INIT_MS;
      const longDeadline = INSIDE_VK_INIT_MAX_MS;

      try {
        if (inVk) {
          await Promise.race([
            bridge.send('VKWebAppInit'),
            new Promise<never>((_, reject) => {
              setTimeout(
                () => reject(new Error('VKWebAppInit timeout (still loading shell)')),
                longDeadline,
              );
            }),
          ]);
        } else {
          await Promise.race([
            bridge.send('VKWebAppInit'),
            new Promise<never>((_, reject) => {
              setTimeout(
                () => reject(new Error('VKWebAppInit timeout')),
                shortDeadline,
              );
            }),
          ]);
        }
      } catch {
        // Outside the VK client the bridge may never respond — still mount the shell.
      }
      // Fetch initial config to set the correct colour scheme immediately.
      try {
        const config = inVk
          ? await Promise.race([
              bridge.send('VKWebAppGetConfig'),
              new Promise<never>((_, reject) => {
                setTimeout(
                  () => reject(new Error('VKWebAppGetConfig timeout')),
                  longDeadline,
                );
              }),
            ])
          : await Promise.race([
              bridge.send('VKWebAppGetConfig'),
              new Promise<never>((_, reject) => {
                setTimeout(
                  () => reject(new Error('VKWebAppGetConfig timeout')),
                  shortDeadline,
                );
              }),
            ]);
        const isDark =
          (config as unknown as { scheme?: string }).scheme === 'space_gray' ||
          (config as unknown as { scheme?: string }).scheme === 'vkcom_dark';
        applyTheme(isDark ? 'dark' : 'light');
      } catch {
        // Ignore — config may not be available in some web clients.
      }
    },

    async openExternalUrl(url: string) {
      // Android/iOS: if `VKWebAppOpenURL` is not wired in the native bridge, `send` is a no-op
      // and the promise never resolves — YooKassa never opens. In-app navigation is reliable
      // (YooKassa blocks iframe embedding; full WebView navigation is OK).
      if (bridge.isWebView()) {
        window.location.assign(url);
        return;
      }

      // m.vk.ru / desktop: try delegated open via parent; fall back to same-tab navigation.
      const sendOpenUrl = bridge.send as (
        method: string,
        props?: object,
      ) => ReturnType<typeof bridge.send>;

      let openedViaBridge = false;
      try {
        const raced = await Promise.race([
          sendOpenUrl('VKWebAppOpenURL', { url }).then(() => 'ok' as const),
          new Promise<'timeout'>((resolve) => {
            setTimeout(() => resolve('timeout'), 3500);
          }),
        ]);
        openedViaBridge = raced === 'ok';
      } catch {
        openedViaBridge = false;
      }

      if (!openedViaBridge) {
        window.location.assign(url);
      }
    },

    getTheme() {
      return document.documentElement.classList.contains('dark') ? 'dark' : 'light';
    },

    onThemeChange(callback) {
      themeListeners.add(callback);
      return () => themeListeners.delete(callback);
    },

    closeApp() {
      void bridge.send('VKWebAppClose', { status: 'success' });
    },

    /**
     * Дублируем путь в облако VK — после редиректа на ЮKassa localStorage iframe иногда пустеет.
     * Формат JSON: { path, ts } — как в localStorage (см. vk-payment-pending-route).
     */
    persistPrePaymentRoute(sanitizedPathWithSearch: string) {
      if (!sanitizedPathWithSearch.startsWith('/')) return;
      try {
        const payload = JSON.stringify({ path: sanitizedPathWithSearch, ts: Date.now() });
        // Ключ строкой — тот же, что VK_PAYMENT_PENDING_LS_KEY в shared.
        void bridge.send('VKWebAppStorageSet', {
          key: 'sa_vk_payment_pending_route',
          value: payload,
        });
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
