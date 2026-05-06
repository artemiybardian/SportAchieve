import { OpenAPI } from './generated/core/OpenAPI';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '';

export function initApiClient(token?: string | null) {
  OpenAPI.BASE = API_BASE_URL;
  OpenAPI.TOKEN = token ?? undefined;
}

export function setApiToken(token: string | undefined) {
  OpenAPI.TOKEN = token;
}

export { OpenAPI };
