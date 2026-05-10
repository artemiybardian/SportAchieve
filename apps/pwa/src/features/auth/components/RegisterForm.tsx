import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegister } from '../api/use-auth';
import { useToast } from '@/hooks/use-toast';
import { authErrorDescriptionRu, cn } from '@/lib/utils';
import { fieldErrorsFromZodIssues, registerFormSchema } from '../validation';

type RegisterFieldKey = 'email' | 'password';

export function RegisterForm({
  navigationState,
  authNextQuery,
}: {
  navigationState?: unknown;
  authNextQuery?: string | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [errors, setErrors] = useState<Partial<Record<RegisterFieldKey, string>>>({});
  const { toast } = useToast();
  const register = useRegister();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = registerFormSchema.safeParse({
      email,
      password,
      first_name: firstName,
      last_name: lastName,
    });
    if (!parsed.success) {
      setErrors(fieldErrorsFromZodIssues(parsed.error.issues) as Partial<Record<RegisterFieldKey, string>>);
      return;
    }
    setErrors({});
    register.mutate(
      {
        email: parsed.data.email,
        password: parsed.data.password,
        first_name: parsed.data.first_name || undefined,
        last_name: parsed.data.last_name || undefined,
      },
      {
        onError: (err) => {
          toast({
            variant: 'auth',
            title: 'Не удалось зарегистрироваться',
            description: authErrorDescriptionRu(err, 'Проверьте введённые данные.'),
          });
        },
      }
    );
  };

  const clearKey = (key: RegisterFieldKey) => {
    if (errors[key]) setErrors((s) => ({ ...s, [key]: undefined }));
  };

  return (
    <div className="bg-card rounded-2xl shadow-sm border border-border p-6 space-y-5">
      <div>
        <h2 className="text-xl font-bold text-foreground">Регистрация</h2>
        <p className="text-sm text-muted-foreground mt-0.5">Создайте аккаунт SportAchieve</p>
      </div>

      <form noValidate onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="reg-firstName">Имя</Label>
            <Input
              id="reg-firstName"
              placeholder="Иван"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              autoComplete="given-name"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="reg-lastName">Фамилия</Label>
            <Input
              id="reg-lastName"
              placeholder="Иванов"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              autoComplete="family-name"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-email" className={cn(errors.email && 'text-destructive')}>
            Email
          </Label>
          <Input
            id="reg-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              clearKey('email');
            }}
            autoComplete="email"
            error={!!errors.email}
            aria-describedby={errors.email ? 'reg-email-err' : undefined}
          />
          {errors.email ? (
            <p id="reg-email-err" role="alert" className="text-sm text-destructive">
              {errors.email}
            </p>
          ) : null}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="reg-password" className={cn(errors.password && 'text-destructive')}>
            Пароль
          </Label>
          <Input
            id="reg-password"
            type="password"
            placeholder="Минимум 8 символов"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              clearKey('password');
            }}
            autoComplete="new-password"
            error={!!errors.password}
            aria-describedby={errors.password ? 'reg-password-err' : undefined}
          />
          {errors.password ? (
            <p id="reg-password-err" role="alert" className="text-sm text-destructive">
              {errors.password}
            </p>
          ) : null}
        </div>

        <Button type="submit" className="w-full h-12 text-base font-semibold btn-press" disabled={register.isPending}>
          {register.isPending ? 'Создание аккаунта...' : 'Зарегистрироваться'}
        </Button>
      </form>

      <p className="text-sm text-muted-foreground text-center">
        Уже есть аккаунт?{' '}
        <Link
          to={
            authNextQuery ? `/login?next=${encodeURIComponent(authNextQuery)}` : '/login'
          }
          className="text-primary hover:underline font-semibold"
          state={navigationState}
        >
          Войти
        </Link>
      </p>
    </div>
  );
}
