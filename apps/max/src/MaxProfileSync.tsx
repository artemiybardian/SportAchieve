import { useEffect, useRef } from 'react';
import { useAppSelector } from '@/store';
import { queryClient } from '@/lib/query-client';
import { queryKeys } from '@/lib/query-keys';

const SESSION_KEY = 'sa_max_profile_synced';

/**
 * After JWT is issued, syncs the user's name and avatar from window.WebApp.initDataUnsafe
 * to the backend (for the header greeting and profile page).
 */
export function MaxProfileSync() {
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
        const user = window.WebApp?.initDataUnsafe?.user;
        if (!user || cancelled) return;

        const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
        const res = await fetch(`${apiBase}/api/user/max-profile`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            first_name: user.first_name ?? '',
            last_name: user.last_name ?? '',
            profile_photo: user.photo_url ?? null,
          }),
        });
        if (res.ok) {
          if (typeof sessionStorage !== 'undefined') {
            sessionStorage.setItem(SESSION_KEY, token);
          }
          await queryClient.invalidateQueries({ queryKey: queryKeys.user });
        }
      } catch (err) {
        console.warn('[MaxProfileSync]', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, token]);

  return null;
}
