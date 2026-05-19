// Type declaration for window.WebApp injected by the MAX bridge CDN script.
interface Window {
  WebApp?: {
    initData: string;
    initDataUnsafe: {
      query_id?: string;
      auth_date?: number;
      hash?: string;
      start_param?: string;
      user?: {
        id: number;
        first_name: string;
        last_name: string;
        username?: string | null;
        language_code?: string;
        photo_url?: string | null;
      };
    };
    platform?: string;
    version?: string;
    close?: () => void;
  };
}
