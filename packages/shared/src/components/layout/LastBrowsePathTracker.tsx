import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { rememberLastBrowsePath } from '@/lib/last-browse-path';
import { maybeClearMaxPaymentPendingForMachineRoute } from '@/lib/max-payment-pending-route';
import { maybeClearVkPaymentPendingForMachineRoute } from '@/lib/vk-payment-pending-route';

/** Запоминает URL внутри /exercise/… для возврата после «Повторить онбординг» и т.п. */
export function LastBrowsePathTracker() {
  const location = useLocation();

  useEffect(() => {
    rememberLastBrowsePath(location.pathname, location.search);
    maybeClearVkPaymentPendingForMachineRoute(location.pathname);
    maybeClearMaxPaymentPendingForMachineRoute(location.pathname);
  }, [location.pathname, location.search]);

  return null;
}
