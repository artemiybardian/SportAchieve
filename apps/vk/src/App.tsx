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
import { VkThemeSync } from './VkThemeSync';
import { VkProfileSync } from './VkProfileSync';
import { VkPaymentReturnListener } from './VkPaymentReturnListener';
import { VkDeepLinkNavigator } from './VkDeepLinkNavigator';
import { VkOpenInClientHint } from './VkOpenInClientHint';
import type { Platform } from '@sportachieve/platform-vk';
import { useEffect } from 'react';
import { getVkMemoryRouterInitialEntries } from './vkMemoryRouterInitial';

function AppRoutes() {
  useEffect(() => {
    void AnalyticsLogger.init();
    void AnalyticsLogger.logAppOpen();
  }, []);

  return (
    <MemoryRouter initialEntries={getVkMemoryRouterInitialEntries()}>
      <LastBrowsePathTracker />
      <VkThemeSync />
      <VkProfileSync />
      <VkPaymentReturnListener />
      <VkDeepLinkNavigator />
      <Routes>
        <Route path="/login" element={<VkOpenInClientHint />} />
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
        <ThemeProvider vkClientSchemeSync>
          <PlatformProvider platform={platform}>
            <AppRoutes />
            {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
          </PlatformProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
