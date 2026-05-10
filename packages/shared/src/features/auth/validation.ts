import { z } from 'zod';

const EMAIL_BASIC_MSG = 'Укажите корректный email.';
const PASSWORD_MIN_MSG = 'Пароль — не меньше 8 символов.';

export const loginFormSchema = z.object({
  email: z.string().trim().min(1, 'Введите email.').email(EMAIL_BASIC_MSG),
  password: z.string().min(1, 'Введите пароль.').min(8, PASSWORD_MIN_MSG),
});

export const registerFormSchema = z.object({
  email: z.string().trim().min(1, 'Введите email.').email(EMAIL_BASIC_MSG),
  password: z.string().min(8, PASSWORD_MIN_MSG),
  first_name: z.string().transform((s) => s.trim()),
  last_name: z.string().transform((s) => s.trim()),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
export type RegisterFormValues = z.infer<typeof registerFormSchema>;

/** Первое сообщение Zod на каждое поле (плоские path[0]). */
export function fieldErrorsFromZodIssues(
  issues: readonly { path?: readonly PropertyKey[]; message?: string }[],
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of issues) {
    const key = issue.path?.[0];
    if (typeof key !== 'string') continue;
    if (out[key] !== undefined) continue;
    out[key] = issue.message ?? 'Проверьте значение.';
  }
  return out;
}
