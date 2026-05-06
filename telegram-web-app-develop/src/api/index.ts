import { OpenAPI } from './generated';

/**
 * Configure the API client.
 *
 * This setup allows us to dynamically set the base URL and the authorization token.
 * In a Telegram Mini App, the token is often obtained after authenticating with the Telegram init data.
 */

// Default base URL - can be overridden by environment variables if needed
OpenAPI.BASE = (import.meta.env.VITE_API_BASE_URL as string);

// Initialize token from localStorage if it exists
const savedToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
if (savedToken) {
  OpenAPI.TOKEN = savedToken;
}

/**
 * Set the authorization token for all API requests.
 * @param token The JWT token to use for authorization.
 */
export const setApiToken = (token: string | undefined) => {
  OpenAPI.TOKEN = token;
};

// Re-export generated services and models for easier access
export * from './generated';
