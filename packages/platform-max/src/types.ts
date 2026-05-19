// Shared Platform interface — extended to include 'max'.
export interface Platform {
  name: 'pwa' | 'vk' | 'max';
  init(): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  getTheme(): 'light' | 'dark';
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
  closeApp(): void;
  persistPrePaymentRoute?(sanitizedPathWithSearch: string): void;
}
