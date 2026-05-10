# SportAchieve: кратко о VK Mini App на основе PWA

## Структура

- **`backend-develop`** — тот же Django API; добавляются валидация launch params VK, поле `vk_id` у пользователя, `POST /api/token/vk`, правка `return_url` для подписок под VK.
- **`pwa`** — эталонный браузерный клиент; после этапа монорепо переезжает в **`apps/pwa`**, логика выносится в **`packages/shared`**.
- **`apps/vk`** — новое мини-приложение VK: тот же UI-стек (Tailwind + Radix), без PWA/SW/manifest.
- **`packages/shared`** — API-клиент, store, фичи без привязки к платформе.
- **`packages/platform-pwa`** / **`packages/platform-vk`** — адаптеры: открытие внешних URL, тема, вход.

## Стек VK Mini App

| Слой | Технологии |
|------|------------|
| Сборка | Vite, React, TypeScript |
| Стили и UI | Tailwind, Radix (как в PWA) |
| Маршруты | React Router (`MemoryRouter` в VK) |
| Данные с сервера | TanStack Query |
| Локальный стейт | Redux Toolkit (общий с PWA через shared) |
| Платформа | `@vkontakte/vk-bridge` |
| Бэкенд | Тот же Django; JWT после проверки подписи VK |

**Авторизация:** только данные запуска из VK Bridge — сырой query в `POST /api/token/vk`, проверка HMAC на бэке (`VK_CLIENT_SECRET`), выдача того же JWT, что для остальных клиентов. Email и пароль в VK-сборке не используются.

**Оплата:** YooKassa как сейчас; открытие `confirmation_url` через `VKWebAppOpenURL`; `return_url` вида `https://vk.com/app{VK_APP_ID}#payment={payment_id}`; финальный статус — webhook в БД; на фронте разбор `window.location.hash` и связь `payment_id ↔ user_id` на бэке.

---

## Порядок работ (последовательно)

1. **Бэкенд** — поле `vk_id` + миграция; `VKValidation` (подпись по доке VK, anti-replay по `vk_ts`, `hmac.compare_digest`); `POST /api/token/vk`; `UserService.save_if_not_exist_vk`; env `VK_APP_ID`, `VK_CLIENT_SECRET`, `VK_APP_BASE_URL`; CORS под домен VK-фронта.

2. **Подписки** — в создании платежа учитывать платформу VK: `return_url` с хостом VK и `#payment=...`; webhook не ломать.

3. **Монорепо** — корневой `package.json` (workspaces), перенос `pwa` → `apps/pwa`, правка Docker/Makefile; проверка сборки PWA без изменения поведения.

4. **`packages/shared`** — вынести API, store, общие хуки и сервисы; подключить из `apps/pwa`.

5. **Адаптеры платформы** — интерфейс + реализация для браузера и VK (`VKWebAppInit`, `VKWebAppOpenURL`, события темы/safe area).

6. **`apps/vk`** — скаффолд по образцу PWA без `vite-plugin-pwa`; вход: `launch_params` → токен → приложение; роутинг через `MemoryRouter`; экраны логина/регистрации не показывать.

7. **Платежи в VK** — `openExternalUrl` через bridge; общий хук обработки `#payment=...` (и при желании унификация с query в PWA).

8. **Деплой** — `deploy/vk` (Docker + nginx), HTTPS, заголовки/CDP так, чтобы фронт открывался в iframe VK; мини-приложение в кабинете VK (доверенный URL).

9. **Финиш** — регрессия PWA после ключевых шагов; чеклист VK (iOS/Android/Web): вход, тема, оплата и возврат по hash.

---

Полный план с диаграммами и чек-листом безопасности — артефакт Cursor **vk-mini-app-from-pwa** (при необходимости экспортируйте в `docs/` в репозитории).
