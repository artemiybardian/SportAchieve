import { type ReactNode } from 'react';
import { render, type RenderOptions } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { QueryClient } from '@tanstack/react-query';
import { configureStore } from '@reduxjs/toolkit';
import authReducer from '@/store/slices/authSlice';

function makeStore(preloadedState?: { auth?: { token: string | null; isAuthenticated: boolean } }) {
  return configureStore({
    reducer: { auth: authReducer },
    preloadedState,
  });
}

function makeQueryClient() {
  return new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
}

interface WrapperProps {
  children: ReactNode;
  routerProps?: MemoryRouterProps;
  authenticated?: boolean;
}

function AllProviders({ children, routerProps, authenticated = false }: WrapperProps) {
  const store = makeStore(
    authenticated ? { auth: { token: 'test-token', isAuthenticated: true } } : undefined
  );
  const queryClient = makeQueryClient();
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <MemoryRouter {...routerProps}>
          {children}
          <Toaster />
        </MemoryRouter>
      </QueryClientProvider>
    </ReduxProvider>
  );
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  routerProps?: MemoryRouterProps;
  authenticated?: boolean;
}

export function renderWithProviders(ui: ReactNode, options: CustomRenderOptions = {}) {
  const { routerProps, authenticated, ...rest } = options;
  return render(ui, {
    wrapper: ({ children }) => (
      <AllProviders routerProps={routerProps} authenticated={authenticated}>
        {children}
      </AllProviders>
    ),
    ...rest,
  });
}
