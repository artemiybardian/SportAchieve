import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import { store } from '@/store';
import { initApiClient } from '@/api/client';
import { setApiToken } from '@/api/client';
import { queryClient, registerSessionGuard } from '@/lib/query-client';
import { logout } from '@/store/slices/authSlice';

registerSessionGuard(() => {
  if (!store.getState().auth.isAuthenticated) return;
  setApiToken(undefined);
  store.dispatch(logout());
  queryClient.clear();
});

// Initialize API client synchronously before first render so all queries have correct BASE and TOKEN
initApiClient(store.getState().auth.token);

// Keep token in sync when Redux auth state changes (login / logout)
store.subscribe(() => {
  setApiToken(store.getState().auth.token ?? undefined);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
