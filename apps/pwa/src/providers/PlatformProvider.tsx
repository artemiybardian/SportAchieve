import { createContext, useContext, type ReactNode } from 'react';

export interface Platform {
  name: 'pwa' | 'vk';
  init(): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  getTheme(): 'light' | 'dark';
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
  closeApp(): void;
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
  return <PlatformContext.Provider value={{ platform }}>{children}</PlatformContext.Provider>;
}

export function usePlatform(): Platform {
  const ctx = useContext(PlatformContext);
  if (!ctx) {
    throw new Error('usePlatform must be used inside <PlatformProvider>');
  }
  return ctx.platform;
}

/** В PWA контекста нет — вернётся null; в VK мини-приложении задаётся в {@link PlatformProvider}. */
export function usePlatformOptional(): Platform | null {
  const ctx = useContext(PlatformContext);
  return ctx?.platform ?? null;
}
