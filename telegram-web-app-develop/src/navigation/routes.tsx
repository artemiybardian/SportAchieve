import type { ComponentType, JSX } from 'react';
import ExerciseMachinesPage from "@/pages/ExerciseMachinesPage.tsx";
import ExercisePage from "@/pages/ExercisePage.tsx";
import UserProfilePage from "@/pages/UserProfilePage.tsx";
import OnboardingPage, {OnboardingStep} from "@/components/ui/Onboarding/OnboardingPage.tsx";
import {BigLogoIcon} from "@/components/ui/Icons";
import onboardingImageTwo from "@/assets/onboarding-two.png";
import onboardingImageThree from "@/assets/onboarding-three.png";
import LoginPage from "@/pages/LoginPage/LoginPage.tsx";
import { useAppDispatch } from '@/store';
import { completeOnboarding } from '@/store/slices/userSlice';
import { useNavigate } from 'react-router-dom';
import { useStartParam } from '@/hooks/useStartParam';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';

const onboardingSteps: OnboardingStep[] = [
  {
    icon: <BigLogoIcon />,
    title: "Добро пожаловать в SportAchieve!",
    description: "Приложение помогает быстро разобраться с упражнениями на тренажерах в зале.",
    buttonText: "Далее",
  },
  {
    icon: <img src={onboardingImageTwo} alt="" style={{ maxWidth: "260px", maxHeight: "240px", objectFit: "contain" }} />,
    title: "Просто отсканируй стикер",
    description: "Поднеси телефон к NFC-стикеру на тренажере — приложение откроется автоматически",
    buttonText: "Далее",
  },
  {
    icon: <img src={onboardingImageThree} alt="" style={{ maxWidth: "260px", maxHeight: "240px", objectFit: "contain" }} />,
    title: "Бесплатные и платные упражнения",
    description: "Базовые упражнения — бесплатно. Расширенная библиотека упражнений доступна по подписке",
    buttonText: "Начать тренировку",
    buttonOnClick: () => {
      window.location.href = '/exercise/machine';
    }
  }
];

const OnboardingWrapper = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { machineId } = useStartParam();

  const handleComplete = () => {
    void AnalyticsLogger.logOnboardingComplete();
    void dispatch(completeOnboarding());

    if (machineId) {
      navigate(`/exercise/machine/${machineId}`, { replace: true });
    } else {
      navigate('/exercise/machine', { replace: true });
    }
  };

  const stepsWithAction = onboardingSteps.map((step, index) => {
    if (index === onboardingSteps.length - 1) {
      return { ...step, buttonOnClick: handleComplete };
    }
    return step;
  });

  return <OnboardingPage steps={stepsWithAction} />;
};

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  { path: '/exercise/machine', Component: ExerciseMachinesPage },
  { path: '/exercise/machine/:machineId', Component: ExerciseMachinesPage },
  { path: '/', Component: LoginPage },
  { path: '/onboarding', Component: OnboardingWrapper },
  { path: '/exercise/:exerciseId/:instructionType?', Component: ExercisePage },
  { path: '/user', Component: UserProfilePage },
];
