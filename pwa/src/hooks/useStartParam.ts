import { useSearchParams } from 'react-router-dom';

export interface StartParam {
  gymId: string | undefined;
  machineId: string | undefined;
}

export function useStartParam(): StartParam {
  const [searchParams] = useSearchParams();
  return {
    gymId: searchParams.get('gym') ?? undefined,
    machineId: searchParams.get('equipment') ?? undefined,
  };
}
