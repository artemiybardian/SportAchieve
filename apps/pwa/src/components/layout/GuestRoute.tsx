import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';

export function GuestRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    return <Outlet />;
  }

  // После успешного login/register уже isAuthenticated=true, но нужно успеть выполнить
  // LoginPage / RegisterPage (онбординг, ?next= с QR). Иначе сразу уходим на «/»
  // и теряется путь вида /exercise/machine/<uuid>?gym=…
  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Outlet />;
  }

  return <Navigate to="/" replace />;
}
