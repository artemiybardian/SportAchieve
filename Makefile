.PHONY: help dev dev-d prod prod-nginx prod-dns prod-twa down logs ngrok ngrok-backend ngrok-pwa ngrok-twa yookassa-webhook-url pwa-dev pwa-build seed seed-clear

SHELL := /bin/bash

# Подстановка DB_*, YOOKASSA_*, VITE_* из backend-develop/.env
COMPOSE := docker compose --env-file backend-develop/.env

API_PORT := 8160
PWA_PORT := 3160
GATEWAY_PORT := 9190

help:
	@echo "Команды:"
	@echo "  make dev                   — профиль dev: postgres, redis, backend, vite, celery (передний план)"
	@echo "  make dev-d                 — то же в фоне (-d)"
	@echo "  make prod                  — prod + Caddy :80,:443 (отдельный VPS без своего nginx)"
	@echo "  make prod-nginx            — prod без Caddy: :8160 + :3160 (HTTPS — system nginx, см. deploy/nginx-host/)"
	@echo "  make prod-dns              — prod + Caddy + DuckDNS (DUCKDNS_TOKEN в .env)"
	@echo "  make prod-twa              — полный prod: TMA :3181 + PWA :3160 + gateway :9190 (без Caddy)"
	@echo "  make down                  — остановить все сервисы (dev + prod)"
	@echo "  make logs                  — compose logs -f"
	@echo "  make ngrok                 — https-туннель на API ($(API_PORT))"
	@echo "  make ngrok-backend         — то же, что ngrok ($(API_PORT))"
	@echo "  make ngrok-pwa             — https-туннель на prod PWA nginx ($(PWA_PORT))"
	@echo "  make ngrok-twa             — https-туннель на gateway :$(GATEWAY_PORT) (TMA + API через один URL)"
	@echo "  make yookassa-webhook-url — после запуска ngrok: URL для ЮKassa (…/api/yookasa/log)"
	@echo "  make pwa-dev               — Vite dev-сервер для PWA (порт 5174)"
	@echo "  make pwa-build             — production сборка PWA"
	@echo "  make seed                  — заполнить БД демо-данными (manage.py seed_data)"
	@echo "  make seed-clear            — очистить и снова seed"
	@echo ""
	@echo "Без Makefile:"
	@echo "  docker compose --env-file backend-develop/.env --profile dev up --build"

dev:
	$(COMPOSE) --profile dev up --build

dev-d:
	$(COMPOSE) --profile dev up --build -d

# PWA-only prod: HTTPS через контейнер Caddy (на сервере с system nginx на :80 — используйте prod-nginx).
prod:
	$(COMPOSE) --profile prod --profile caddy up --build -d --scale frontend_prod=0 --scale gateway=0

# PWA-only prod для хоста, где :80/:443 уже заняты nginx (см. deploy/nginx-host/sportachieve.duckdns.org.conf + certbot).
prod-nginx:
	$(COMPOSE) --profile prod up --build -d --scale frontend_prod=0 --scale gateway=0

prod-dns:
	$(COMPOSE) --profile prod --profile caddy --profile duckdns up --build -d --scale frontend_prod=0 --scale gateway=0

# Полный prod: PWA (:3160), TMA (:3181), gateway (:9190). HTTPS снаружи: nginx → 9190 или отдельный туннель.
prod-twa:
	$(COMPOSE) --profile prod up --build -d

down:
	$(COMPOSE) --profile dev --profile prod down --remove-orphans

logs:
	$(COMPOSE) --profile dev --profile prod logs -f

ngrok:
	ngrok http $(API_PORT)

ngrok-backend:
	ngrok http $(API_PORT)

ngrok-pwa:
	ngrok http $(PWA_PORT)

# Туннель для Telegram Mini App: gateway проксирует и TMA, и API
ngrok-twa:
	ngrok http $(GATEWAY_PORT)

yookassa-webhook-url:
	@python3 scripts/ngrok-yookassa-webhook-url.py

pwa-dev:
	cd pwa && npm run dev

pwa-build:
	cd pwa && npm run build

# Заполнить БД тестовыми данными (idempotent — повторный запуск безопасен)
seed:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data

# То же, но сначала очистить существующие данные
seed-clear:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data --clear

