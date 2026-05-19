import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import App from './App';
import { store } from '@/store';
import { initApiClient, setApiToken } from '@/api/client';
import { setToken, logout } from '@/store/slices/authSlice';
import { queryClient, registerSessionGuard } from '@/lib/query-client';
import { createVkPlatform } from '@sportachieve/platform-vk';
import { getRawVkLaunchParams } from './vkLaunchParams';
import { hydrateVkPaymentPendingFromHost, setupVkPaymentPendingHostSync } from './vkHydratePaymentPending';

registerSessionGuard(() => {
  if (!store.getState().auth.isAuthenticated) return;
  setApiToken(undefined);
  store.dispatch(logout());
  queryClient.clear();
});

const platform = createVkPlatform();

const TOKEN_FETCH_MS = 15000;

async function bootstrap() {
  // Initialise the VK bridge first — must be called synchronously before any renders.
  await platform.init();
  setupVkPaymentPendingHostSync();
  await hydrateVkPaymentPendingFromHost();

  // Initialise API client with any previously-stored token.
  initApiClient(store.getState().auth.token);

  // Keep the OpenAPI token in sync with Redux.
  store.subscribe(() => {
    setApiToken(store.getState().auth.token ?? undefined);
  });

  // Authenticate against the backend using VK launch params (iframe URL).
  const rawLaunchParams = getRawVkLaunchParams();

  if (rawLaunchParams && !store.getState().auth.isAuthenticated) {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
      const url = `${apiBase}/api/token/vk?launch_params=${encodeURIComponent(rawLaunchParams)}`;
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), TOKEN_FETCH_MS);
      const res = await fetch(url, { method: 'POST', signal: ctrl.signal });
      window.clearTimeout(t);
      if (res.ok) {
        const data = (await res.json()) as { token: string };
        store.dispatch(setToken(data.token));
        setApiToken(data.token);
      } else {
        console.error('[VK auth] Backend rejected launch params, status', res.status);
      }
    } catch (err) {
      console.error('[VK auth] Network error during token exchange', err);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App platform={platform} />
    </StrictMode>,
  );
}

void bootstrap().catch((e) => console.error('[bootstrap]', e));
