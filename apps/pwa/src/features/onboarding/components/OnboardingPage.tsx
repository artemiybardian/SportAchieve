import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { useCompleteOnboarding } from '@/features/user/api/use-user';
import type { MeResponse } from '@/features/auth/api/auth';
import { queryKeys } from '@/lib/query-keys';
import {
  clearAuthReturnStorage,
  resolveReturnPathAfterAuth,
} from '@/lib/auth-return-path';
import { peekLastBrowsePath } from '@/lib/last-browse-path';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { cn } from '@/lib/utils';
import { BrandLogo } from '@/features/onboarding/components/BrandLogo';
import { useTheme } from '@/providers/ThemeProvider';
import onboardingNfc from '@/assets/onboarding-nfc.png';
import onboardingSubscriptions from '@/assets/onboarding-two.png';

interface Step {
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
}

const steps: Step[] = [
  {
    icon: <BrandLogo />,
    title: 'Добро пожаловать в SportAchieve!',
    description: 'Приложение помогает быстро разобраться с упражнениями на тренажерах в зале.',
    buttonText: 'Далее',
  },
  {
    icon: (
      <img
        src={onboardingNfc}
        alt=""
        className="h-auto max-h-[min(240px,42vh)] w-auto max-w-[min(260px,90vw)] object-contain"
      />
    ),
    title: 'Просто отсканируй стикер',
    description:
      'Поднеси телефон к NFC-стикеру на тренажере — приложение откроется автоматически',
    buttonText: 'Далее',
  },
  {
    icon: (
      <img
        src={onboardingSubscriptions}
        alt=""
        className="h-auto max-h-[min(240px,42vh)] w-auto max-w-[min(260px,90vw)] object-contain"
      />
    ),
    title: 'Бесплатные и платные упражнения',
    description:
      'Базовые упражнения — бесплатно. Расширенная библиотека доступна по подписке',
    buttonText: 'Начать тренировку',
  },
];

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const { setThemeOverride } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const nextQuery = searchParams.get('next');
  const completeOnboarding = useCompleteOnboarding();

  const step = steps[currentStep];

  useEffect(() => {
    setThemeOverride(currentStep === 0 ? 'light' : 'dark');
    return () => setThemeOverride(null);
  }, [currentStep, setThemeOverride]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((s) => s + 1);
    } else {
      void AnalyticsLogger.logOnboardingComplete();
      completeOnboarding.mutate(undefined, {
        onSuccess: async () => {
          queryClient.setQueryData<MeResponse>(queryKeys.user, (prev) =>
            prev ? { ...prev, is_onboarding_complete: true } : prev,
          );
          await queryClient.refetchQueries({ queryKey: queryKeys.user });
          const target =
            resolveReturnPathAfterAuth({
              locationState: location.state,
              nextQuery,
            }) ??
            peekLastBrowsePath() ??
            '/exercise/machine';
          clearAuthReturnStorage();
          navigate(target, { replace: true });
        },
      });
    }
  };

  return (
    <div
      className={cn(
        'theme-fade page-transition flex max-h-[100dvh] h-[100dvh] flex-col overflow-hidden overscroll-none bg-background',
        'pt-[max(0.25rem,env(safe-area-inset-top,0px))]',
        'pb-[max(0.5rem,env(safe-area-inset-bottom,0px))]',
      )}
    >
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6">
        <div className="flex max-h-[min(280px,46vh)] w-full min-h-0 shrink-0 flex-col items-center justify-center">
          {step.icon}
        </div>

        <div
          className="w-full max-w-xs shrink-0 space-y-2 px-1 text-center"
          key={currentStep}
          style={{ animation: 'fadeIn 0.35s ease-out' }}
        >
          <h2 className="text-2xl font-bold leading-tight text-foreground">{step.title}</h2>
          <p className="text-base leading-relaxed text-muted-foreground">{step.description}</p>
        </div>
      </main>

      <footer className="flex w-full shrink-0 flex-col items-center gap-4 px-6 pt-2">
        <div className="flex gap-2">
          {steps.map((_, i) => (
            <div
              key={i}
              className="rounded-full transition-all duration-300"
              style={{
                width: i === currentStep ? 24 : 8,
                height: 8,
                backgroundColor:
                  i === currentStep
                    ? 'hsl(var(--primary))'
                    : 'hsl(var(--muted-foreground) / 0.3)',
              }}
            />
          ))}
        </div>

        <Button
          onClick={handleNext}
          disabled={completeOnboarding.isPending}
          className="btn-press h-14 w-full max-w-xs text-base font-semibold"
        >
          {step.buttonText}
        </Button>
      </footer>
    </div>
  );
}
