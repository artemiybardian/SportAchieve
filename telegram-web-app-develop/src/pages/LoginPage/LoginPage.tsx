import { useEffect } from 'react';
import { Page } from '@/components/Page';
import { useAppDispatch, useAppSelector } from '@/store';
import { loginByTelegram, logout, setTelegramId } from '@/store/slices/authSlice';
import { Spinner, Title, Text } from '@telegram-apps/telegram-ui';
import { useNavigate } from 'react-router-dom';
import { useLaunchParams } from '@tma.js/sdk-react';
import { useStartParam } from '@/hooks/useStartParam';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';


export default function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error, isAuthenticated, isRefreshed, telegramId: storedTelegramId } = useAppSelector((state) => state.auth);
  const { isOnboardingComplete } = useAppSelector((state) => state.user);
  const lp = useLaunchParams();
  const rawInitData = window.location.hash.replace("#", "").replace("initData=", "").replace("tgWebAppData=", "")
  const { machineId, gymId, raw: startParam } = useStartParam();

  useEffect(() => {
    void AnalyticsLogger.logAppOpen(gymId);
  }, []);

  useEffect(() => {
    const currentTelegramId = lp.tgWebAppData?.user?.id;

    if (currentTelegramId && currentTelegramId !== storedTelegramId) {
      console.debug("Account mismatch detected. Clearing storage and re-authenticating.");
      dispatch(logout());
      dispatch(setTelegramId(currentTelegramId));
      if (rawInitData) {
        void dispatch(loginByTelegram(rawInitData));
      }
      return;
    }

    if (!isRefreshed && rawInitData) {
      console.debug("App open. Requesting new token.");
      void dispatch(loginByTelegram(rawInitData));
      if (currentTelegramId) {
        dispatch(setTelegramId(currentTelegramId));
      }
      return;
    }

    if (isAuthenticated && isRefreshed) {
      console.debug("startParam:", startParam)
      console.debug("Gym ID:", gymId);
      console.debug("Machine ID:", machineId);

      if (!isOnboardingComplete) {
        navigate('/onboarding', { replace: true });
        return;
      }

      if (machineId !== undefined && machineId !== null && machineId !== "") {
        navigate(`/exercise/machine/${machineId}`, { replace: true });
      } else {
        navigate('/exercise/machine', { replace: true });
      }

    } else if (!isRefreshed && rawInitData) {
      // Handled above
    } else {
      console.error("No init data or user is not authenticated");
    }
  }, [rawInitData, dispatch, isAuthenticated, isRefreshed, navigate, lp.initData, storedTelegramId, startParam]);

  return (
    <Page back={false}>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        {isLoading ? (
          <>
            <Spinner size="l" />
            <Title level="2" weight="1" style={{ marginTop: '16px' }}>
              Authenticating...
            </Title>
          </>
        ) : error ? (
          <>
            <Title level="2" weight="1" style={{ color: 'var(--tg-theme-destructive-text-color)' }}>
              Login Failed
            </Title>
            <Text style={{ marginTop: '8px', color: 'var(--tg-theme-destructive-text-color)' }}>
              {error}
            </Text>
          </>
        ) : (
          <Title level="2" weight="1">
            Preparing your experience...
          </Title>
        )}
      </div>
    </Page>
  );
}
