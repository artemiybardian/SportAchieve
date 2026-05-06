import { initData } from '@tma.js/sdk-react';

export function useStartParam() {
  const startParam = initData.startParam();
  
  const params: Record<string, string> = {};
  if (startParam) {
    const paramsRaw = startParam.split("-");
    paramsRaw.forEach(param => {
      const [key, value] = param.split("_");
      if (key && value) {
        params[key] = value;
      }
    });
  }

  return {
    params,
    gymId: params["gym"],
    machineId: params["equipment"],
    raw: startParam
  };
}
