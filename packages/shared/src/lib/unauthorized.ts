import { ApiError } from '@/api/generated/core/ApiError';

export const API_REQUEST_TIMEOUT_MS = 20_000;

export function isUnauthorizedError(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}
