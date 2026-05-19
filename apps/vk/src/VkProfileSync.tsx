import { useEffect, useRef } from 'react';
import bridge from '@vkontakte/vk-bridge';
import { useAppSelector } from '@/store';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

const SESSION_KEY = 'sa_vk_profile_synced';

type VkUserInfoPayload = {
  first_name?: string;
  last_name?: string;
  photo_200?: string;
  photo_100?: string;
};

/**
 * После выдачи JWT подтягиваем имя, фамилию и аватар через VKWebAppGetUserInfo
 * и сохраняем на бэкенде (для приветствия в шапке и профиля).
 *
 * Email в Mini Apps отдельно: только через VKWebAppGetEmail с явным согласием пользователя.
 */
export function VkProfileSync() {
  const token = useAppSelector((s) => s.auth.token);
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const ranForToken = useRef<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !token) return;
    if (typeof sessionStorage !== 'undefined' && sessionStorage.getItem(SESSION_KEY) === token) {
      return;
    }
    if (ranForToken.current === token) return;
    ranForToken.current = token;

    let cancelled = false;

    void (async () => {
      try {
        const raw = await bridge.send('VKWebAppGetUserInfo');
        if (cancelled) return;
        const info = raw as unknown as VkUserInfoPayload;
        const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
        const res = await fetch(`${apiBase}/api/user/vk-profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: info.first_name ?? '',
            last_name: info.last_name ?? '',
            profile_photo: info.photo_200 ?? info.photo_100 ?? null,
          }),
        });
        if (res.ok) {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, token);
          }
          await queryClient.invalidateQueries({ queryKey: queryKeys.user });
        }
      } catch (err) {
        console.warn('[VkProfileSync]', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  return null;
}
