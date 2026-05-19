import { useState } from 'react';
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
    icon: <BrandLogo variant="onDark" />,
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
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const nextQuery = searchParams.get('next');
  const completeOnboarding = useCompleteOnboarding();

  const step = steps[currentStep];

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
        'page-transition header-gradient fixed inset-0 z-10 flex w-full max-w-[100vw] flex-col overflow-hidden overscroll-none',
      )}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
        paddingLeft: 'env(safe-area-inset-left, 0px)',
        paddingRight: 'env(safe-area-inset-right, 0px)',
      }}
    >
      <main className="flex min-h-0 flex-1 flex-col items-center justify-center gap-4 overflow-y-auto overflow-x-hidden px-6 pt-2 sm:px-8 sm:gap-6">
        <div className="flex w-full max-w-md min-h-0 flex-shrink-0 flex-col items-center justify-center py-2">
          {step.icon}
        </div>

        <div
          className="w-full max-w-md shrink-0 space-y-3 px-1 text-center"
          key={currentStep}
          style={{ animation: 'fadeIn 0.35s ease-out' }}
        >
          <h2 className="text-xl font-bold leading-snug text-white sm:text-2xl">{step.title}</h2>
          <p className="text-sm leading-relaxed text-white/85 sm:text-base">{step.description}</p>
        </div>
      </main>

      <footer
        className="flex w-full shrink-0 flex-col items-center gap-4 border-t border-white/15 bg-black/10 px-6 pt-4 backdrop-blur-sm"
        style={{
          paddingBottom: 'max(1.25rem, calc(env(safe-area-inset-bottom, 0px) + 0.75rem))',
        }}
      >
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
                    ? 'hsl(var(--brand-cyan))'
                    : 'hsl(0 0% 100% / 0.28)',
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
