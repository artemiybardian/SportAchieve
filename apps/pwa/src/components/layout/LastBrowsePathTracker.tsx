import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { rememberLastBrowsePath } from '@/lib/last-browse-path';

/** Запоминает URL внутри /exercise/… для возврата после «Повторить онбординг» и т.п. */
export function LastBrowsePathTracker() {
  const location = useLocation();

  useEffect(() => {
    rememberLastBrowsePath(location.pathname, location.search);
  }, [location.pathname, location.search]);

  return null;
}
