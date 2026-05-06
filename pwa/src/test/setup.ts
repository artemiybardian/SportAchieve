import '@testing-library/jest-dom';
import { beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './msw/server';
import { OpenAPI } from '@/api/generated/core/OpenAPI';
import { TEST_API_BASE } from './config';

OpenAPI.BASE = TEST_API_BASE;

beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
