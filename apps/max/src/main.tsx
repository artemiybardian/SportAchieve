import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '@/index.css';
import App from './App';
import { store } from '@/store';
import { initApiClient, setApiToken } from '@/api/client';
import { setToken } from '@/store/slices/authSlice';
import { createMaxPlatform } from '@sportachieve/platform-max';
import { getRawMaxInitData } from './maxLaunchParams';

const platform = createMaxPlatform();

const TOKEN_FETCH_MS = 15000;

async function bootstrap() {
  // Initialise the MAX platform (applies system theme, no bridge call needed).
  await platform.init();

  // Initialise API client with any previously-stored token.
  initApiClient(store.getState().auth.token);

  // Keep the OpenAPI token in sync with Redux.
  store.subscribe(() => {
    setApiToken(store.getState().auth.token ?? undefined);
  });

  // Authenticate against the backend using MAX initData from window.WebApp.
  const rawInitData = getRawMaxInitData();

  if (rawInitData && !store.getState().auth.isAuthenticated) {
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL ?? '';
      const url = `${apiBase}/api/token/max?init_data=${encodeURIComponent(rawInitData)}`;
      const ctrl = new AbortController();
      const t = window.setTimeout(() => ctrl.abort(), TOKEN_FETCH_MS);
      const res = await fetch(url, { method: 'POST', signal: ctrl.signal });
      window.clearTimeout(t);
      if (res.ok) {
        const data = (await res.json()) as { token: string };
        store.dispatch(setToken(data.token));
        setApiToken(data.token);
      } else {
        console.error('[MAX auth] Backend rejected initData, status', res.status);
      }
    } catch (err) {
      console.error('[MAX auth] Network error during token exchange', err);
    }
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App platform={platform} />
    </StrictMode>,
  );
}

void bootstrap().catch((e) => console.error('[bootstrap]', e));
