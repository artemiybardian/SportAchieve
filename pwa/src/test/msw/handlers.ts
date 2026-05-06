import { http, HttpResponse } from 'msw';
import { TEST_API_BASE } from '../config';

const BASE = TEST_API_BASE;

export const handlers = [
  http.post(`${BASE}/api/auth/register`, () =>
    HttpResponse.json({ token: 'test-token-register' })
  ),

  http.post(`${BASE}/api/auth/login`, () =>
    HttpResponse.json({ token: 'test-token-login' })
  ),

  http.get(`${BASE}/api/auth/me`, () =>
    HttpResponse.json({
      id: 1,
      username: 'testuser',
      email: 'test@example.com',
      first_name: 'Test',
      last_name: 'User',
      profile_photo: null,
      is_onboarding_complete: false,
    })
  ),

  http.get(`${BASE}/api/trainers/:id`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      id,
      name: 'Жим лёжа',
      photo: null,
      description: 'Тренажер для грудных мышц',
      muscles: [{ id: 1, name: 'Грудь' }],
      exercises: [
        { id: 1, name: 'Жим', cover: null, description: 'Базовое', access_type: 'FREE' },
        { id: 2, name: 'Разводка', cover: null, description: 'Изоляция', access_type: 'PAID' },
      ],
    });
  }),

  http.get(`${BASE}/api/exercises/:id`, ({ params }) => {
    return HttpResponse.json({
      id: Number(params.id),
      name: 'Жим',
      description: 'Базовое упражнение',
      access_type: 'FREE',
      muscles: [{ id: 1, name: 'Грудь' }],
      instruction_type: 'A',
      instruction: [],
      video_url: null,
      cover: null,
    });
  }),

  http.get(`${BASE}/api/invoices/types`, () =>
    HttpResponse.json([
      { id: 1, name: '1 месяц', description: 'Доступ на 1 месяц', price: 299, scop_type: 'ALL', exercises: [] },
      { id: 2, name: '3 месяца', description: 'Доступ на 3 месяца', price: 699, scop_type: 'ALL', exercises: [] },
    ])
  ),

  http.get(`${BASE}/api/subscriptions`, () => HttpResponse.json(null)),

  http.get(`${BASE}/api/user`, () =>
    HttpResponse.json({
      id: 1,
      username: 'testuser',
      photo: '',
      last_name: 'User',
      first_name: 'Test',
      is_onboarding_complete: false,
    })
  ),

  http.get(`${BASE}/api/events/types`, () => HttpResponse.json([])),

  http.post(`${BASE}/api/onboarding/complete`, () => HttpResponse.json({})),

  http.get(`${BASE}/api/subscriptions`, () => HttpResponse.json(null)),
];
