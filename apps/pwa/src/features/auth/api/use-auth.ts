import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useDispatch } from 'react-redux';
import { setToken, logout } from '@/store/slices/authSlice';
import { setApiToken } from '@/api/client';
import { AuthPwdService, type LoginRequest, type RegisterRequest } from './auth';
import { blurActiveElement } from '@/lib/dom';
import { queryKeys } from '@/lib/query-keys';

export function useMe(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.user,
    queryFn: () => AuthPwdService.me(),
    enabled,
    staleTime: 1000 * 60 * 5,
  });
}

export function useLogin() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: LoginRequest) => AuthPwdService.login(data),
    onSuccess: (data) => {
      blurActiveElement();
      setApiToken(data.token);
      dispatch(setToken(data.token));
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useRegister() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RegisterRequest) => AuthPwdService.register(data),
    onSuccess: (data) => {
      blurActiveElement();
      setApiToken(data.token);
      dispatch(setToken(data.token));
      queryClient.invalidateQueries({ queryKey: queryKeys.user });
    },
  });
}

export function useLogout() {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  return () => {
    setApiToken(undefined);
    dispatch(logout());
    queryClient.clear();
  };
}
