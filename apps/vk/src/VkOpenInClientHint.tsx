/** Shown when the user is not authenticated (e.g. opened the app URL in a normal browser). */
export function VkOpenInClientHint() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-background px-6 text-center">
      <p className="text-lg font-medium text-foreground">Откройте приложение в клиенте VK</p>
      <p className="max-w-md text-sm text-muted-foreground">
        Сайт работает внутри мини-приложения VK. В обычном браузере вход недоступен. Запустите
        приложение из VK или отсканируйте QR в карточке приложения.
      </p>
    </div>
  );
}
