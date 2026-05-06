import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/store';
import { fetchUser, fetchSubscription } from '@/store/slices/userSlice';

export const useUser = () => {
  const dispatch = useAppDispatch();
  const { user, subscription, isLoading, error } = useAppSelector((state) => state.user);
  const { isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      if (!user) {
        void dispatch(fetchUser());
      }
      if (!subscription) {
        void dispatch(fetchSubscription());
      }
    }
  }, [dispatch, isAuthenticated, user, subscription]);

  const calculateDaysLeft = () => {
    if (!subscription || !subscription.is_valid) return 0;
    
    // The subscription schema has updated_at and created_at, 
    // and SubscriptionTypeSchema has access_duration_in_days.
    // Usually, expiration is created_at + access_duration_in_days.
    // However, if the API doesn't provide an exact expiration date, 
    // we might need to be careful.
    
    const createdAt = new Date(subscription.created_at);
    const durationDays = subscription.type.access_duration_in_days;
    const expirationDate = new Date(createdAt.getTime() + durationDays * 24 * 60 * 60 * 1000);
    const now = new Date();
    
    const diffTime = expirationDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays > 0 ? diffDays : 0;
  };

  return {
    user,
    subscription,
    isLoading,
    error,
    daysLeft: calculateDaysLeft(),
    fullName: user ? `${user.first_name} ${user.last_name}`.trim() || user.username : '',
    avatarUrl: user?.photo || '',
  };
};
