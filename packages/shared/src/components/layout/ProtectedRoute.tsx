import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/store';
import { persistAuthReturnTarget } from '@/lib/auth-return-path';

export function ProtectedRoute() {
  const isAuthenticated = useAppSelector((s) => s.auth.isAuthenticated);
  const location = useLocation();

  if (!isAuthenticated) {
    persistAuthReturnTarget(location.pathname, location.search);
    const full = `${location.pathname}${location.search || ''}`;
    const nextEnc = encodeURIComponent(full);
    return (
      <Navigate
        to={`/login?next=${nextEnc}`}
        state={{ from: { pathname: location.pathname, search: location.search } }}
        replace
      />
    );
  }
  return <Outlet />;
}
