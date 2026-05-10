import { MemoryRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Provider as ReduxProvider } from 'react-redux';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { store } from '@/store';
import { queryClient } from '@/lib/query-client';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import { ExerciseMachinesPage } from '@/pages/ExerciseMachinesPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { OnboardingPage } from '@/features/onboarding/components/OnboardingPage';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { PlatformProvider } from '@/providers/PlatformProvider';
import { VkThemeSync } from './VkThemeSync';
import { VkPaymentReturnListener } from './VkPaymentReturnListener';
import { VkOpenInClientHint } from './VkOpenInClientHint';
import type { Platform } from '@sportachieve/platform-vk';
import { useEffect } from 'react';

function AppRoutes() {
  useEffect(() => {
    void AnalyticsLogger.init();
    void AnalyticsLogger.logAppOpen();
  }, []);

  return (
    <MemoryRouter>
      <VkThemeSync />
      <VkPaymentReturnListener />
      <Routes>
        <Route path="/login" element={<VkOpenInClientHint />} />
        {/* No login/register in VK — user is always authenticated via VK Bridge */}
        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/exercise/machine/:machineId?" element={<ExerciseMachinesPage />} />
          <Route path="/exercise/:exerciseId/:instructionType?" element={<ExercisePage />} />
          <Route path="/user" element={<UserProfilePage />} />
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
        <PlatformProvider platform={platform}>
          <AppRoutes />
          {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
        </PlatformProvider>
      </QueryClientProvider>
    </ReduxProvider>
  );
}
