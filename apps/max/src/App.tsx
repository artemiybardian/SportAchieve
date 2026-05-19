import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/store';
import { queryClient } from '@/lib/query-client';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { OnboardingGate } from '@/components/layout/OnboardingGate';
import { LastBrowsePathTracker } from '@/components/layout/LastBrowsePathTracker';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';
import { ExerciseMachinesPage } from '@/pages/ExerciseMachinesPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { OnboardingPage } from '@/features/onboarding/components/OnboardingPage';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { PlatformProvider } from '@/providers/PlatformProvider';
import { MaxDeepLinkNavigator } from './MaxDeepLinkNavigator';
import { MaxProfileSync } from './MaxProfileSync';
import { MaxPaymentReturnListener } from './MaxPaymentReturnListener';
import { MaxOpenInClientHint } from './MaxOpenInClientHint';
import type { Platform } from '@sportachieve/platform-max';
import { useEffect } from 'react';
import { getMaxMemoryRouterInitialEntries } from './maxMemoryRouterInitial';

function AppRoutes() {
  useEffect(() => {
    void AnalyticsLogger.init();
    void AnalyticsLogger.logAppOpen();
  }, []);

  return (
    <MemoryRouter initialEntries={getMaxMemoryRouterInitialEntries()}>
      <LastBrowsePathTracker />
      <MaxProfileSync />
      <MaxPaymentReturnListener />
      <MaxDeepLinkNavigator />
      <Routes>
        <Route path="/login" element={<MaxOpenInClientHint />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<OnboardingGate />}>
            <Route path="/onboarding" element={<OnboardingPage />} />
            <Route path="/exercise/machine/:machineId?" element={<ExerciseMachinesPage />} />
            <Route path="/exercise/:exerciseId/:instructionType?" element={<ExercisePage />} />
            <Route path="/user" element={<UserProfilePage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/exercise/machine" replace />} />
      </Routes>
      <Toaster />
    </MemoryRouter>
  );
}

export default function App({ platform }: { platform: Platform }) {
  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <PlatformProvider platform={platform}>
            <AppRoutes />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </PlatformProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
