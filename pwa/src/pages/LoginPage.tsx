import { useEffect } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { useAppSelector } from '@/store';
import { useMe } from '@/features/user/api/use-user';
import { useStartParam } from '@/hooks/useStartParam';
import {
  clearAuthReturnStorage,
  resolveReturnPathAfterAuth,
} from '@/lib/auth-return-path';
import { peekLastBrowsePath } from '@/lib/last-browse-path';

export function LoginPage() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const { data: me } = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const nextQuery = searchParams.get('next');
  const { machineId } = useStartParam();

  useEffect(() => {
    if (!isAuthenticated) return;
    if (me === undefined) return;

    const returnPath =
      resolveReturnPathAfterAuth({ locationState: location.state, nextQuery }) ||
      (machineId ? `/exercise/machine/${machineId}` : null) ||
      peekLastBrowsePath();

    if (!me.is_onboarding_complete) {
      if (returnPath && returnPath !== '/login' && returnPath !== '/register') {
        navigate(`/onboarding?next=${encodeURIComponent(returnPath)}`, {
          replace: true,
          state: location.state,
        });
      } else {
        navigate('/onboarding', { replace: true, state: location.state });
      }
      return;
    }

    if (returnPath && returnPath !== '/login') {
      clearAuthReturnStorage();
      navigate(returnPath, { replace: true });
      return;
    }
    navigate(machineId ? `/exercise/machine/${machineId}` : '/exercise/machine', {
      replace: true,
    });
  }, [isAuthenticated, me, navigate, machineId, nextQuery, location.state]);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background page-transition">
      {/* Градиент на всю высоту над формой; два flex-1 дают симметричные отступы вокруг бренда */}
      <div
        className="header-gradient flex flex-1 min-h-0 flex-col pt-[max(0.75rem,env(safe-area-inset-top,0px))]"
      >
        <div className="flex-1 min-h-0" aria-hidden />
        <div className="flex shrink-0 flex-col items-center px-6">
          <div
            className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-black text-white shadow-lg"
            style={{
              backgroundColor: 'hsl(var(--brand-cyan) / 0.25)',
              border: '1.5px solid hsl(var(--brand-cyan) / 0.5)',
            }}
          >
            SA
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white">SportAchieve</h1>
          <p className="mt-1 text-sm text-white/60">Достигай результатов</p>
        </div>
        <div className="flex-1 min-h-0" aria-hidden />
      </div>

      <div className="shrink-0 px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] pt-3">
        <div className="mx-auto w-full max-w-sm">
          <LoginForm navigationState={location.state} authNextQuery={nextQuery ?? undefined} />
        </div>
      </div>
    </div>
  );
}
