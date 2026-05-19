import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useMe } from '@/features/user/api/use-user';

/**
 * Онбординг по флагу `is_onboarding_complete` из БД (`GET /api/auth/me`).
 * Пока в ответе `false`, перенаправляем на `/onboarding` с `?next=` (тренажёр после QR и т.д.).
 */
export function OnboardingGate() {
  const { data: me, isPending, isError } = useMe();
  const location = useLocation();

  if (isPending && !isError) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (me && !me.is_onboarding_complete && location.pathname !== '/onboarding') {
    const next = encodeURIComponent(`${location.pathname}${location.search || ''}`);
    return <Navigate to={`/onboarding?next=${next}`} replace />;
  }

  return <Outlet />;
}
