import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { LastBrowsePathTracker } from '@/components/layout/LastBrowsePathTracker';
import { AppProviders } from '@/providers/AppProviders';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import { GuestRoute } from '@/components/layout/GuestRoute';
import { Toaster } from '@/components/ui/toaster';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ExerciseMachinesPage } from '@/pages/ExerciseMachinesPage';
import { ExercisePage } from '@/pages/ExercisePage';
import { UserProfilePage } from '@/pages/UserProfilePage';
import { OnboardingPage } from '@/features/onboarding/components/OnboardingPage';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { PaymentReturnListener } from '@/features/subscriptions/components/PaymentReturnListener';

function AppRoutes() {
  useEffect(() => {
    void AnalyticsLogger.init();
    void AnalyticsLogger.logAppOpen();
  }, []);

  return (
    <BrowserRouter>
      <LastBrowsePathTracker />
      <PaymentReturnListener />
      <Routes>
        <Route element={<GuestRoute />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/exercise/machine/:machineId?" element={<ExerciseMachinesPage />} />
          <Route path="/exercise/:exerciseId/:instructionType?" element={<ExercisePage />} />
          <Route path="/user" element={<UserProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/exercise/machine" replace />} />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default function App() {
  return (
    <AppProviders>
      <AppRoutes />
    </AppProviders>
  );
}
