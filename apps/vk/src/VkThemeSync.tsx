import { useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';

/**
 * Subscribes to VK Bridge config events and keeps the Tailwind `dark` class
 * on `<html>` in sync with the VK app colour scheme.
 *
 * Also syncs the CSS custom property for status-bar / safe-area overlay so
 * the existing `env(safe-area-inset-*)` rules in index.css keep working
 * inside the VK WebView.
 */
export function VkThemeSync() {
  useEffect(() => {
    function applyScheme(scheme: string | undefined) {
      const isDark = scheme === 'space_gray' || scheme === 'vkcom_dark';
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }

    const unsubscribe = bridge.subscribe((event) => {
      const { type, data } = event.detail;
      if (type === 'VKWebAppUpdateConfig' || type === 'VKWebAppViewRestore') {
        applyScheme((data as { scheme?: string }).scheme);
      }
    });

    // Apply the initial scheme.
    bridge.send('VKWebAppGetConfig').then((config) => {
      applyScheme((config as unknown as { scheme?: string }).scheme);
    }).catch(() => {
      // Ignore — some VK web clients don't support this call.
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return null;
}
