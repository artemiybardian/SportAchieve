import { createContext, useContext, type ReactNode } from 'react';

export interface Platform {
  name: 'pwa' | 'vk' | 'max';
  init(): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  getTheme(): 'light' | 'dark';
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
  closeApp(): void;
  /** Только VK: дублирует маршрут в VKWebAppStorage (часто переживает оплату лучше, чем localStorage WebView). */
  persistPrePaymentRoute?(sanitizedPathWithSearch: string): void;
}

interface PlatformContextValue {
  platform: Platform;
}

const PlatformContext = createContext<PlatformContextValue | null>(null);

export function PlatformProvider({
  platform,
  children,
}: {
  platform: Platform;
  children: ReactNode;
}) {
  return (
    <PlatformContext.Provider value={{ platform }}>
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform(): Platform {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used inside <PlatformProvider>');
  }
  return ctx.platform;
}

/** Returns the platform if available, or null — safe to call in shared components used by both PWA and VK. */
export function usePlatformOptional(): Platform | null {
  const ctx = useContext(PlatformContext);
  return ctx?.platform ?? null;
}
