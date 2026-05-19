import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Loader2, Lock, QrCode } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { Header } from '@/components/layout/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { SubscriptionSheet } from '@/features/subscriptions/components/SubscriptionSheet';
import { useTrainer } from '@/features/exercises/api/use-exercises';
import { useUser } from '@/features/user/api/use-user';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import { useNavigate } from 'react-router-dom';
import { ApiError, type ExerciseInstructionType } from '@/api/generated';

type TabId = 'M' | 'F' | null;

function ScanScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8 gap-6 bg-background page-transition">
      <div
        className="w-24 h-24 rounded-3xl flex items-center justify-center shadow-lg"
        style={{ background: 'linear-gradient(135deg, hsl(var(--brand-navy)) 0%, hsl(238 50% 35%) 100%)' }}
      >
        <QrCode className="w-12 h-12 text-white" />
      </div>
      <div className="text-center space-y-2 max-w-xs">
        <h2 className="text-2xl font-bold text-foreground">Отсканируйте QR-код</h2>
        <p className="text-muted-foreground leading-relaxed">
          Поднесите камеру к QR-коду на тренажёре, чтобы открыть инструкцию
        </p>
      </div>
    </div>
  );
}

export function ExerciseMachinesPage() {
  const { machineId } = useParams<{ machineId?: string }>();
  const navigate = useNavigate();

  const [tab, setTab] = useState<TabId>(null);
  const [subscriptionOpen, setSubscriptionOpen] = useState(false);
  const { greetingName, avatarUrl, subscription, daysLeft } = useUser();

  const instructionType = tab as ExerciseInstructionType | null;
  const { data: trainer, isLoading, error } = useTrainer(machineId ?? '', instructionType);

  const hasSubscription = subscription?.is_valid ?? false;

  useEffect(() => {
    if (machineId) void AnalyticsLogger.logGymView(0);
  }, [machineId]);

  const tabs: { id: TabId; name: string }[] = [
    { id: null, name: 'Все' },
    { id: 'M', name: 'Мужчины' },
    { id: 'F', name: 'Женщины' },
  ];

  // Нет UUID в URL — показываем экран "Отсканируйте QR"
  if (!machineId) {
    return (
      <Page back={false}>
        <ScanScreen />
      </Page>
    );
  }

  if (isLoading) {
    return (
      <Page back={false}>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  if (!trainer) {
    const apiStatus = error instanceof ApiError ? error.status : undefined;
    const subtitle =
      apiStatus === 404
        ? 'Проверьте QR-код или обратитесь в зал.'
        : apiStatus === 401 || apiStatus === 403
          ? 'Войдите в приложение или обновите страницу.'
          : 'Не удалось загрузить данные. Проверьте сеть и попробуйте ещё раз.';
    return (
      <Page back={false}>
        <div className="flex flex-col items-center justify-center px-6 text-center min-h-[40vh] gap-2">
          <p className="text-lg font-semibold text-foreground">
            {apiStatus === 404 ? 'Тренажёр не найден' : apiStatus === 401 || apiStatus === 403 ? 'Нужна авторизация' : 'Ошибка загрузки'}
          </p>
          <p className="text-sm text-muted-foreground max-w-sm">{subtitle}</p>
        </div>
      </Page>
    );
  }

  const hasPaidExercises = trainer.exercises.some((e) => e.access_type === 'PAID');
  const BLUR_COUNT = 2;
  const freeExercises = trainer.exercises.filter((e) => e.access_type !== 'PAID');
  const paidExercises = trainer.exercises.filter((e) => e.access_type === 'PAID');
  const visibleExercises =
    !hasSubscription && hasPaidExercises
      ? [...freeExercises, ...paidExercises.slice(0, BLUR_COUNT)]
      : trainer.exercises;

  return (
    <Page back={false}>
      <Header name={greetingName} avatarUrl={avatarUrl} daysLeft={daysLeft} hasSubscription={hasSubscription} />

      {/* Trainer info */}
      <div className="px-4 sm:px-5 py-5 space-y-3 w-full min-w-0">
        {trainer.photo && (
          <div className="flex justify-center py-2">
            <img src={trainer.photo} alt={trainer.name} className="w-full max-w-56 object-contain drop-shadow-sm" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground break-words">{trainer.name}</h1>
        <div className="flex flex-wrap gap-1.5 w-full min-w-0">
          {trainer.muscles.map((m) => (
            <Badge
              key={m.id}
              variant="secondary"
              className="text-xs max-w-full break-words whitespace-normal text-left leading-snug items-start h-auto py-1.5"
            >
              {m.name}
            </Badge>
          ))}
        </div>
        <p className="text-muted-foreground text-sm leading-relaxed break-words">{trainer.description}</p>
      </div>

      {/* Exercises section */}
      <div className="mx-2 sm:mx-3 rounded-2xl px-3 sm:px-4 pb-8 bg-secondary/30 relative overflow-hidden w-full max-w-full min-w-0 box-border">
        {/* Paywall overlay */}
        {!hasSubscription && hasPaidExercises && (
          <div
            className="paywall-overlay absolute bottom-0 left-0 right-0 z-10 flex flex-col justify-end pb-5 px-5"
            style={{ height: 220 }}
          >
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <Lock className="h-4 w-4 text-primary" />
                </div>
                <span className="font-bold text-base text-foreground">Доступно после оплаты</span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Откройте полный доступ ко всем упражнениям и продвинутым техникам.
              </p>
              <Button
                className="w-full h-12 text-base font-semibold btn-press"
                onClick={() => setSubscriptionOpen(true)}
              >
                Оформить подписку
              </Button>
            </div>
          </div>
        )}

        <div className="pt-4">
          <h2 className="text-lg font-bold text-foreground mb-3 text-center">Упражнения</h2>
          <div className="flex gap-1 bg-muted rounded-xl p-1 w-full min-w-0 mb-3">
            {tabs.map((t) => (
              <button
                key={String(t.id)}
                onClick={() => setTab(t.id)}
                className={`flex-1 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  tab === t.id
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {t.name}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-0">
          {visibleExercises.map((exercise, idx) => {
            const isLocked = exercise.access_type === 'PAID' && !hasSubscription;
            const blurIdx = !hasSubscription ? paidExercises.indexOf(exercise) : -1;
            const blurClass =
              isLocked && blurIdx === 0
                ? 'opacity-50 blur-[1px] pointer-events-none select-none'
                : isLocked && blurIdx >= 1
                  ? 'opacity-30 blur-[2px] pointer-events-none select-none'
                  : '';

            return (
              <div key={exercise.id} className={blurClass}>
                <button
                  className="w-full min-w-0 text-left py-4 cursor-pointer hover:bg-accent/40 rounded-xl transition-colors px-1 sm:px-2 -mx-1 sm:-mx-2 btn-press"
                  onClick={() => {
                    if (isLocked) return;
                    void AnalyticsLogger.logExerciseClick(exercise.id);
                    navigate(`/exercise/${exercise.id}/${tab ?? 'A'}`);
                  }}
                >
                  {exercise.cover && (
                    <div className="flex justify-center mb-3">
                      <img src={exercise.cover} alt={exercise.name} className="w-full max-w-48 object-contain" />
                    </div>
                  )}
                  <div className="flex flex-wrap items-start gap-x-2 gap-y-1 mb-1 min-w-0">
                    <span className="font-semibold text-base text-foreground break-words min-w-0 flex-1">
                      {exercise.name}
                    </span>
                    <Badge
                      variant={exercise.access_type === 'PAID' ? 'pro' : 'success'}
                      className="text-xs shrink-0 self-start"
                    >
                      {exercise.access_type === 'PAID' ? 'Pro' : 'Бесплатно'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground leading-snug break-words">{exercise.description}</p>
                </button>
                {idx < visibleExercises.length - 1 && <Separator className="my-0" />}
              </div>
            );
          })}
        </div>
      </div>

      <div className="h-8" />

      <SubscriptionSheet open={subscriptionOpen} onOpenChange={setSubscriptionOpen} />
    </Page>
  );
}
