import { useEffect } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { useTheme } from '@/providers/ThemeProvider';

/**
 * Держит Redux/theme state в соответствии со схемой клиента ВК, пока пользователь
 * сам не переключил тему ({@link ThemeProvider} тогда перестаёт принимать события ВК).
 */
export function VkThemeSync() {
  const { applyVkClientScheme } = useTheme();

  useEffect(() => {
    if (!applyVkClientScheme) return;

    const applyScheme = (scheme: string | undefined) => {
      const isDark = scheme === 'space_gray' || scheme === 'vkcom_dark';
      applyVkClientScheme(isDark);
    };

    const unsubscribe = bridge.subscribe((event) => {
      const { type, data } = event.detail;
      if (type === 'VKWebAppUpdateConfig' || type === 'VKWebAppViewRestore') {
        applyScheme((data as { scheme?: string }).scheme);
      }
    });

    bridge
      .send('VKWebAppGetConfig')
      .then((config) => {
        applyScheme((config as unknown as { scheme?: string }).scheme);
      })
      .catch(() => {
        // Некоторые web-клиенты ВК не отвечают на этот вызов.
      });

    return () => {
      unsubscribe();
    };
  }, [applyVkClientScheme]);

  return null;
}
