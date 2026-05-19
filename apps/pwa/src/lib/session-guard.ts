import { MutationCache, QueryCache, QueryClient } from '@tanstack/react-query';
import { isUnauthorizedError } from '@/lib/unauthorized';

let clearUnauthorizedSession: (() => void) | undefined;

export function registerSessionGuard(handler: () => void) {
  clearUnauthorizedSession = handler;
}

function handleUnauthorizedError(error: unknown) {
  if (isUnauthorizedError(error)) {
    clearUnauthorizedSession?.();
  }
}

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: handleUnauthorizedError,
  }),
  mutationCache: new MutationCache({
    onError: handleUnauthorizedError,
  }),
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,
      retry: (failureCount, error) => {
        if (isUnauthorizedError(error)) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});
