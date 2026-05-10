import { OpenAPI } from '@/api/client';
import { request } from '@/api/generated/core/request';
import type { CancelablePromise } from '@/api/generated/core/CancelablePromise';

export interface RegisterRequest {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthTokenResponse {
  token: string;
}

export interface MeResponse {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  profile_photo: string | null;
  is_onboarding_complete: boolean;
}

export const AuthPwdService = {
  register(data: RegisterRequest): CancelablePromise<AuthTokenResponse> {
    return request(OpenAPI, {
      method: 'POST',
      url: '/api/auth/register',
      body: data,
      mediaType: 'application/json',
    });
  },

  login(data: LoginRequest): CancelablePromise<AuthTokenResponse> {
    return request(OpenAPI, {
      method: 'POST',
      url: '/api/auth/login',
      body: data,
      mediaType: 'application/json',
    });
  },

  me(): CancelablePromise<MeResponse> {
    return request(OpenAPI, {
      method: 'GET',
      url: '/api/auth/me',
    });
  },
};
