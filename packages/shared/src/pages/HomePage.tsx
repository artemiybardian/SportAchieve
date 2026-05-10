import { useLogout } from '@/features/auth/api/use-auth';
import { Button } from '@/components/ui/button';

export function HomePage() {
  const handleLogout = useLogout();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 gap-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">SportAchieve</h1>
        <p className="text-muted-foreground mt-2">Добро пожаловать!</p>
      </div>
      <Button variant="outline" onClick={handleLogout}>
        Выйти
      </Button>
    </div>
  );
}
