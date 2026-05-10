import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { OnboardingService, SubscriptionService } from '@/api/generated';
import { AuthPwdService } from '@/features/auth/api/auth';
import { queryKeys } from '@/lib/query-keys';
import { useAppSelector } from '@/store';

export function useMe() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => AuthPwdService.me(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSubscription() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  return useQuery({
    queryKey: queryKeys.subscription,
    queryFn: () => SubscriptionService.apiViewsGetUserSubscription(),
    enabled: isAuthenticated,
    staleTime: 1000 * 60 * 2,
  });
}

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => OnboardingService.apiViewsCompleteOnboarding(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useCancelSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (subscriptionId: number) => SubscriptionService.apiViewsDeleteSubscription(subscriptionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.subscription });
    },
  });
}

export function useUser() {
  const { data: me, isLoading } = useMe();
  const { data: subscription } = useSubscription();

  const fullName = me ? `${me.first_name} ${me.last_name}`.trim() || me.username : '';
  const avatarUrl = me?.profile_photo ?? '';

  const daysLeft = (() => {
    if (!subscription?.is_valid) return 0;
    const createdAt = new Date(subscription.created_at);
    const expDate = new Date(createdAt.getTime() + subscription.type.access_duration_in_days * 86400000);
    const diff = Math.ceil((expDate.getTime() - Date.now()) / 86400000);
    return diff > 0 ? diff : 0;
  })();

  return { me, subscription, isLoading, fullName, avatarUrl, daysLeft };
}
