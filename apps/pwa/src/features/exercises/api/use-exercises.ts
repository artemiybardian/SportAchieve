import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TrainersService, ExercisesService, InvoicesService, SubscriptionService } from '@/api/generated';
import type { ExerciseInstructionType, InvoiceCreateSchema } from '@/api/generated';
import { queryKeys } from '@/lib/query-keys';

export function useTrainerList() {
  return useQuery({
    queryKey: queryKeys.trainers.all,
    queryFn: () => TrainersService.apiViewsListTrainers(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useTrainer(uuid: string, instructionType?: ExerciseInstructionType | null) {
  return useQuery({
    queryKey: queryKeys.trainers.detail(uuid),
    queryFn: () => TrainersService.apiViewsGetTrainer(uuid, instructionType ?? undefined),
    enabled: !!uuid,
    staleTime: 1000 * 60 * 5,
  });
}

export function useExercise(id: number, instructionType: string) {
  return useQuery({
    queryKey: queryKeys.exercises.detail(id, instructionType),
    queryFn: () => ExercisesService.apiViewsGetExercise(id, instructionType as ExerciseInstructionType),
    enabled: id > 0,
    staleTime: 1000 * 60 * 5,
  });
}

export function useInvoiceTypes() {
  return useQuery({
    queryKey: queryKeys.invoices.types,
    queryFn: () => InvoicesService.apiViewsListInvoiceTypes(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useSubscribe() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: InvoiceCreateSchema) => SubscriptionService.apiViewsSubscribe(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
      queryClient.invalidateQueries({ queryKey: queryKeys.invoices.all });
    },
  });
}
