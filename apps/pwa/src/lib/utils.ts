import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ApiError } from '@/api/generated/core/ApiError';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function extractStructuredMessage(body: unknown): string {
  if (!body || typeof body !== 'object') return '';
  const b = body as Record<string, unknown>;
  if (typeof b.message === 'string' && b.message.trim()) return b.message.trim();
  if (typeof b.detail === 'string' && b.detail.trim()) return b.detail.trim();
  if (Array.isArray(b.detail)) {
    const rows = (b.detail as unknown[])
      .map((row) => {
        if (row && typeof row === 'object' && typeof (row as { msg?: string }).msg === 'string') {
          return (row as { msg: string }).msg;
        }
        return null;
      })
      .filter(Boolean) as string[];
    if (rows.length) return rows.slice(0, 5).join(' ');
  }
  return '';
}

/** Сырое сообщение из тела ответа API или из Error (для логов / отладки). */
export function getApiErrorMessage(err: unknown, fallback = 'Что-то пошло не так'): string {
  if (err instanceof ApiError) {
    const fromBody = extractStructuredMessage(err.body);
    if (fromBody) return fromBody;
  }
  if (err instanceof Error && err.message.trim()) return err.message.trim();
  return fallback;
}

const EN_PHRASE_MAP: ReadonlyArray<[RegExp, string]> = [
  [/^bad request$/i, 'Не удалось обработать запрос. Проверьте введённые данные.'],
  [/^unauthorized$/i, 'Сессия истекла или вы не авторизованы — войдите снова.'],
  [/^forbidden$/i, 'Это действие вам сейчас недоступно.'],
  [/^not found$/i, 'Данные не найдены — обновите страницу или откройте ссылку заново.'],
  [/^internal server error$/i, 'Сервис временно недоступен. Попробуйте позже.'],
  [/^bad gateway$/i, 'Сервис временно недоступен — попробуйте позже.'],
  [/^service unavailable$/i, 'Сервис перегружен — попробуйте через несколько минут.'],
  [/generic error/i, 'Запрос не выполнился. Проверьте интернет и попробуйте снова.'],
  [/payment required/i, 'Это доступно по подписке — оформите доступ, чтобы продолжить.'],
  [/invalid email|invalid credentials|bad credentials/i, 'Неверный email или пароль.'],
  [
    /user with this email already exists|already exist|already registered/i,
    'Пользователь с таким email уже зарегистрирован — войдите или укажите другой адрес.',
  ],
  [
    /user already has subscription/i,
    'На этот срок уже действует активная оплата — новый платёж не нужен до её окончания.',
  ],
  [/failed to create payment|yookasa|yookassa/i, 'Не удалось создать оплату. Попробуйте позже или другой способ.'],
  [/trainer not found|exercise not found/i, 'Данные не найдены — обновите страницу или отсканируйте QR ещё раз.'],
  [/subscription type not found/i, 'Такого тарифа нет — обновите страницу.'],
  [/field required|missing/i, 'Заполните все обязательные поля.'],
  [
    /string_too_short|at least \d+ characters|ensure this value has at least/i,
    'Пароль должен быть не короче 8 символов.',
  ],
  [/value is not a valid email address/i, 'Введите корректный адрес электронной почты.'],
];

/**
 * Текст для пользователя: сохраняет русские ответы бэкенда как есть,
 * переводит типичные англ. фразы (старый API, openapi-клиент, валидация).
 */
export function userFriendlyApiError(err: unknown, fallback: string): string {
  const raw = getApiErrorMessage(err, '').trim();
  if (/[а-яё]/i.test(raw)) return raw;

  const status = err instanceof ApiError ? err.status : undefined;
  if (!raw || raw === 'Bad Request' || /^error$/i.test(raw)) {
    if (status === 401) return 'Сессия истекла или вы не авторизованы — войдите снова.';
    if (status === 403) return 'Это действие вам сейчас недоступно.';
    if (status === 404) return 'Данные не найдены — обновите страницу.';
    if (status === 402) return 'Это доступно по подписке — оформите доступ.';
    if (status === 500) return 'Сервис временно недоступен — попробуйте позже.';
    if (status === 502 || status === 503) return 'Сервис временно недоступен — попробуйте позже.';
  }

  for (const [re, ru] of EN_PHRASE_MAP) {
    if (re.test(raw)) return ru;
  }

  if (status === 401) return 'Сессия истекла или вы не авторизованы — войдите снова.';
  if (status === 403) return 'Это действие вам сейчас недоступно.';
  if (status === 404) return 'Данные не найдены — обновите страницу.';
  if (status === 402) return 'Это доступно по подписке — оформите доступ.';
  if (status === 500) return 'Сервис временно недоступен — попробуйте позже.';
  if (status === 502 || status === 503) return 'Сервис временно недоступен — попробуйте позже.';

  return raw || fallback;
}

/** Алиас для форм входа/регистрации */
export function authErrorDescriptionRu(err: unknown, fallback: string): string {
  return userFriendlyApiError(err, fallback);
}
