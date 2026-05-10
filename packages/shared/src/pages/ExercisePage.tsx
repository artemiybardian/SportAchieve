import { useNavigate, useParams } from 'react-router-dom';
import { Loader2, ChevronLeft } from 'lucide-react';
import { Page } from '@/components/layout/Page';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useExercise } from '@/features/exercises/api/use-exercises';
import { AnalyticsLogger } from '@/services/AnalyticsLogger';
import type { InstructionItem } from '@/api/generated';
import { useEffect, useLayoutEffect } from 'react';

export function ExercisePage() {
  const { exerciseId, instructionType } = useParams<{ exerciseId: string; instructionType?: string }>();
  const navigate = useNavigate();
  const type = instructionType === 'F' || instructionType === 'M' ? instructionType : 'A';
  const { data: exercise, isLoading } = useExercise(Number(exerciseId), type);

  /** После клика с длинной страницы тренажёра window.scrollY часто сохраняется — экран упражнения оказывается «ниже заголовка». */
  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [exerciseId, type, isLoading]);

  useEffect(() => {
    if (exercise) {
      void AnalyticsLogger.logPageView(`exercise-${exerciseId}`);
    }
  }, [exercise, exerciseId]);

  const renderInstruction = (item: InstructionItem, index: number) => {
    const { type: itemType, data } = item;
    switch (itemType) {
      case 'Header':
        return (
          <h3 key={index} className="font-bold text-lg text-foreground mt-5 mb-1">
            {data.text}
          </h3>
        );
      case 'paragraph':
        return (
          <p key={index} className="text-sm leading-relaxed text-foreground/85 mt-1">
            {data.text}
          </p>
        );
      case 'Delimiter':
        return <Separator key={index} className="my-5" />;
      case 'List': {
        const items = (data.items ?? []) as Array<{ content: string }>;
        if (data.style === 'ordered') {
          return (
            <ol key={index} className="space-y-2.5 mt-3">
              {items.map((it, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="flex-shrink-0 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-primary-foreground font-bold text-xs">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-snug text-foreground/85">{it.content}</span>
                </li>
              ))}
            </ol>
          );
        }
        return (
          <ul key={index} className="space-y-1.5 mt-3">
            {items.map((it, i) => (
              <li key={i} className="flex gap-2 text-sm text-foreground/85">
                <span className="flex-shrink-0 mt-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                {it.content}
              </li>
            ))}
          </ul>
        );
      }
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <Page back>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Page>
    );
  }

  if (!exercise) {
    return (
      <Page back>
        <div className="flex flex-col items-center justify-center h-64 gap-3 px-8 text-center">
          <p className="text-muted-foreground">Инструкция не найдена. Обратитесь в поддержку.</p>
        </div>
      </Page>
    );
  }

  return (
    <Page back>
      {/* Header info */}
      <div className="px-4 sm:px-5 py-5 space-y-3 w-full min-w-0">
        {exercise.cover && (
          <div className="flex justify-center py-2">
            <img src={exercise.cover} alt={exercise.name} className="w-full max-w-56 object-contain drop-shadow-sm" />
          </div>
        )}
        <h1 className="text-2xl font-bold text-foreground break-words">{exercise.name}</h1>
        <div className="flex flex-wrap gap-1.5 w-full min-w-0">
          {exercise.muscles.map((m) => (
            <Badge
              key={m.id}
              variant="secondary"
              className="text-xs max-w-full break-words whitespace-normal text-left leading-snug items-start h-auto py-1.5"
            >
              {m.name}
            </Badge>
          ))}
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed break-words">{exercise.description}</p>
      </div>

      {/* Video */}
      {exercise.video_url && (
        <div className="px-5 pb-4">
          <div className="rounded-2xl overflow-hidden bg-black relative aspect-video shadow-md">
            <video
              controls
              className="w-full h-full object-contain"
              poster="https://i.imgur.com/o3U19PI_d.webp?maxwidth=760&fidelity=grand"
              onPlay={() => void AnalyticsLogger.logVideoPlay(exerciseId ?? '')}
            >
              <source src={exercise.video_url} />
            </video>
          </div>
        </div>
      )}

      {/* Instructions */}
      {exercise.instruction && exercise.instruction.length > 0 && (
        <div className="mx-4 mb-4 bg-card border border-border rounded-2xl px-5 py-5 shadow-sm">
          {exercise.instruction.map((item, i) => renderInstruction(item, i))}
        </div>
      )}

      {/* Back button */}
      <div className="px-5 pb-10">
        <button
          onClick={() => navigate(-1)}
          className="w-full h-12 rounded-xl border border-border flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors btn-press"
        >
          <ChevronLeft className="h-4 w-4" />
          Назад к тренажёру
        </button>
      </div>
    </Page>
  );
}
