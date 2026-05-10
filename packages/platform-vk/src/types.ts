// Shared Platform interface — re-exported by both platform-pwa and platform-vk.
export interface Platform {
  name: 'pwa' | 'vk';
  init(): Promise<void>;
  openExternalUrl(url: string): Promise<void>;
  getTheme(): 'light' | 'dark';
  onThemeChange(callback: (theme: 'light' | 'dark') => void): () => void;
  closeApp(): void;
}
