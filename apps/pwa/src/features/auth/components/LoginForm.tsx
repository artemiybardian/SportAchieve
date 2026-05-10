import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLogin } from '../api/use-auth';
import { cn } from '@/lib/utils';
import { fieldErrorsFromZodIssues, loginFormSchema } from '../validation';

const CREDENTIALS_ERROR = 'Неверный email или пароль.';

export function LoginForm({
  navigationState,
  authNextQuery,
}: {
  navigationState?: unknown;
  authNextQuery?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Partial<Record<'email' | 'password', string>>>({});
  const [credentialsError, setCredentialsError] = useState(false);
  const login = useLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = loginFormSchema.safeParse({ email, password });
    if (!parsed.success) {
      setCredentialsError(false);
      setErrors(fieldErrorsFromZodIssues(parsed.error.issues) as Partial<Record<'email' | 'password', string>>);
      return;
    }
    setErrors({});
    setCredentialsError(false);
    login.mutate(
      { email: parsed.data.email, password: parsed.data.password },
      {
        onError: () => {
          setCredentialsError(true);
        },
      }
    );
  };

  const highlightCredentials = credentialsError;

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Вход</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Введите email и пароль</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-1.5">
          <Label
            htmlFor="login-email"
            className={cn((errors.email || highlightCredentials) && 'text-destructive')}
          >
            Email
          </Label>
          <Input
            id="login-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (errors.email) setErrors((s) => ({ ...s, email: undefined }));
              if (credentialsError) setCredentialsError(false);
            }}
            autoComplete="email"
            error={!!errors.email || highlightCredentials}
            aria-describedby={
              errors.email ? 'login-email-err' : highlightCredentials ? 'login-credentials-err' : undefined
            }
          />
          {errors.email ? (
            <p id="login-email-err" role="alert" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label
            htmlFor="login-password"
            className={cn((errors.password || highlightCredentials) && 'text-destructive')}
          >
            Пароль
          </Label>
          <Input
            id="login-password"
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (errors.password) setErrors((s) => ({ ...s, password: undefined }));
              if (credentialsError) setCredentialsError(false);
            }}
            autoComplete="current-password"
            error={!!errors.password || highlightCredentials}
            aria-describedby={
              errors.password ? 'login-password-err' : highlightCredentials ? 'login-credentials-err' : undefined
            }
          />
          {errors.password ? (
            <p id="login-password-err" role="alert" className="text-sm text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>

        {highlightCredentials ? (
          <p id="login-credentials-err" role="alert" className="text-sm text-destructive -mt-1">
            {CREDENTIALS_ERROR}
          </p>
        ) : null}

        <Button type="submit" className="w-full h-12 text-base font-semibold btn-press" disabled={login.isPending}>
          {login.isPending ? 'Вход...' : 'Войти'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Нет аккаунта?{' '}
        <Link
          to={
            authNextQuery
              ? `/register?next=${encodeURIComponent(authNextQuery)}`
              : '/register'
          }
          className="text-primary hover:underline font-semibold"
          state={navigationState}
        >
          Зарегистрироваться
        </Link>
      </p>
    </div>
  );
}
