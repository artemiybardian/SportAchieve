.PHONY: help dev dev-d prod prod-nginx prod-vk-nginx prod-dns prod-twa down logs ngrok ngrok-backend ngrok-pwa ngrok-twa ngrok-vk ngrok-vk-dev ngrok-vk-local ngrok-vk-prod vk-ngrok-hint yookassa-webhook-url pwa-dev pwa-build vk-dev vk-build seed seed-clear

SHELL := /bin/bash

# Подстановка DB_*, YOOKASSA_*, VITE_* из backend-develop/.env
COMPOSE := docker compose --env-file backend-develop/.env

API_PORT := 8160
PWA_PORT := 3160
# Vite dev VK Mini App (apps/vk); см. make vk-dev
VK_DEV_PORT := 5175
# Docker: сервис vk / vk_prod (nginx со статикой + прокси /api → backend_prod)
VK_DOCKER_PORT := 3162
GATEWAY_PORT := 9190

help:
	@echo "Команды:"
	@echo "  make dev                   — профиль dev: postgres, redis, backend, vite, celery (передний план)"
	@echo "  make dev-d                 — то же в фоне (-d)"
	@echo "  make prod                  — prod + Caddy :80,:443 (отдельный VPS без своего nginx)"
	@echo "  make prod-nginx            — prod без Caddy: :8160 + :3160 + :3162 (HTTPS — system nginx, см. deploy/nginx-host/)"
	@echo "  make prod-vk-nginx         — то же, но без PWA (только vk_prod :3162 + API :8160)"
	@echo "  make prod-dns              — prod + Caddy + DuckDNS (DUCKDNS_TOKEN в .env)"
	@echo "  make prod-twa              — полный prod: TMA :3181 + PWA :3160 + gateway :9190 (без Caddy)"
	@echo "  make down                  — остановить все сервисы (dev + prod)"
	@echo "  make logs                  — compose logs -f"
	@echo "  make ngrok                 — https-туннель на API ($(API_PORT))"
	@echo "  make ngrok-backend         — то же, что ngrok ($(API_PORT))"
	@echo "  make ngrok-pwa             — https-туннель на prod PWA nginx ($(PWA_PORT))"
	@echo "  make ngrok-vk              — то же, что ngrok-vk-prod (алиас)"
	@echo "  make ngrok-vk-dev          — один туннель на Vite VK (:$(VK_DEV_PORT)); API укажите в apps/vk/.env отдельно"
	@echo "  make ngrok-vk-local        — ДЕВ: два туннеля (Vite :$(VK_DEV_PORT) + API :$(API_PORT))"
	@echo "  make ngrok-vk-prod         — ПРОД: один туннель на vk_prod (:$(VK_DOCKER_PORT)); compose --profile prod + vk_prod"
	@echo "  make vk-ngrok-hint         — подсказки .env / VK под текущие туннели ngrok (:4040)"
	@echo "  make ngrok-twa             — https-туннель на gateway :$(GATEWAY_PORT) (TMA + API через один URL)"
	@echo "  make yookassa-webhook-url — после запуска ngrok: URL для ЮKassa (…/api/yookasa/log)"
	@echo "  make pwa-dev               — Vite dev-сервер для PWA (порт 5174)"
	@echo "  make pwa-build             — production сборка PWA"
	@echo "  make vk-dev                — Vite dev-сервер для VK Mini App (порт 5175)"
	@echo "  make vk-build              — production сборка VK Mini App"
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

# Прод только VK Mini App + backend/celery: без pwa_prod и без TMA frontend.
prod-vk-nginx:
	$(COMPOSE) --profile prod up --build -d --scale frontend_prod=0 --scale gateway=0 --scale pwa_prod=0

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

ngrok-vk: ngrok-vk-prod

# Прод + ngrok: один URL на контейнер vk (статика + /api через nginx). Нужен: docker compose --profile prod с vk_prod.
ngrok-vk-prod:
	ngrok http $(VK_DOCKER_PORT)

# Дев + ngrok: два HTTPS URL (фронт VK + API). Глобальный конфиг с authtoken подмешивается, если есть.
ngrok-vk-local:
	@if [ -f "$$HOME/.config/ngrok/ngrok.yml" ]; then \
		ngrok start vk api --config "$$HOME/.config/ngrok/ngrok.yml" --config "$(CURDIR)/ngrok.vk-local.yml"; \
	elif [ -f "$$HOME/Library/Application Support/ngrok/ngrok.yml" ]; then \
		ngrok start vk api --config "$$HOME/Library/Application Support/ngrok/ngrok.yml" --config "$(CURDIR)/ngrok.vk-local.yml"; \
	else \
		echo "Подсказка: добавьте authtoken — ngrok config add-authtoken <token>"; \
		ngrok start vk api --config "$(CURDIR)/ngrok.vk-local.yml"; \
	fi

# Локальная разработка: сначала make vk-dev, затем во втором терминале ngrok-vk-dev
ngrok-vk-dev:
	ngrok http $(VK_DEV_PORT)

vk-ngrok-hint:
	@VK_DEV_PORT='$(VK_DEV_PORT)' API_DEV_PORT='$(API_PORT)' VK_PROD_PORT='$(VK_DOCKER_PORT)' python3 scripts/vk-ngrok-hint.py

# Туннель для Telegram Mini App: gateway проксирует и TMA, и API
ngrok-twa:
	ngrok http $(GATEWAY_PORT)

yookassa-webhook-url:
	@python3 scripts/ngrok-yookassa-webhook-url.py

pwa-dev:
	cd apps/pwa && npm run dev

pwa-build:
	cd apps/pwa && npm run build

vk-dev:
	cd apps/vk && npm run dev

vk-build:
	cd apps/vk && npm run build

# Заполнить БД тестовыми данными (idempotent — повторный запуск безопасен)
seed:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data

# То же, но сначала очистить существующие данные
seed-clear:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data --clear

