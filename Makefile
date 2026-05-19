.PHONY: help dev dev-d prod prod-nginx prod-caddy prod-vk-nginx prod-dns prod-twa down stop-pwa stop-vk stop-max start-pwa start-vk start-max logs ngrok ngrok-backend ngrok-pwa ngrok-vk ngrok-vk-dev ngrok-vk-local ngrok-vk-prod vk-ngrok-hint ngrok-max ngrok-max-dev ngrok-max-prod yookassa-webhook-url pwa-dev pwa-build vk-dev vk-build max-dev max-build seed seed-clear

SHELL := /bin/bash

# Подстановка DB_*, YOOKASSA_*, VITE_* из backend-develop/.env
COMPOSE := docker compose --env-file backend-develop/.env

API_PORT := 8160
PWA_PORT := 3160
# Vite dev VK Mini App (apps/vk); см. make vk-dev
VK_DEV_PORT := 5175
# Docker: vk_prod (nginx со статикой + /api → backend_prod)
VK_DOCKER_PORT := 3162
# Vite dev MAX Mini App (apps/max); см. make max-dev
MAX_DEV_PORT := 5176
# Docker: max_prod (nginx со статикой + /api → backend_prod)
MAX_DOCKER_PORT := 3163
GATEWAY_PORT := 9190

help:
	@echo "Команды:"
	@echo "  make dev                   — профиль dev: postgres, redis, backend, vite, celery (передний план)"
	@echo "  make dev-d                 — то же в фоне (-d)"
	@echo "  make prod / make prod-nginx — prod: backend :8160 + PWA :3160 + VK :3162 (без TMA/gateway; HTTPS — system nginx, deploy/nginx-host/)"
	@echo "  make prod-caddy            — то же + Caddy :80,:443 (PUBLIC_DOMAIN + PUBLIC_DOMAIN_VK в .env)"
	@echo "  make prod-vk-nginx         — только backend + VK :3162 (без PWA)"
	@echo "  make prod-dns              — prod-caddy + DuckDNS (DUCKDNS_TOKEN, DUCKDNS_SUBDOMAINS)"
	@echo "  make prod-twa              — полный prod: TMA :3181 + PWA :3160 + VK :3162 + gateway :9190"
	@echo "  make down                  — остановить dev + prod (все контейнеры compose)"
	@echo "  make stop-pwa              — остановить только контейнер pwa_prod"
	@echo "  make stop-vk               — остановить только контейнер vk_prod"
	@echo "  make stop-max              — остановить только контейнер max_prod"
	@echo "  make start-pwa / start-vk / start-max — снова запустить контейнер после stop-*"
	@echo "  make logs                  — compose logs -f"
	@echo "  make ngrok                 — https-туннель на API ($(API_PORT))"
	@echo "  make ngrok-backend         — то же, что ngrok ($(API_PORT))"
	@echo "  make ngrok-pwa             — https-туннель на prod PWA nginx ($(PWA_PORT))"
	@echo "  make ngrok-vk              — то же, что ngrok-vk-prod (алиас)"
	@echo "  make ngrok-vk-dev          — туннель на Vite VK (:$(VK_DEV_PORT))"
	@echo "  make ngrok-vk-local        — два туннеля (Vite :$(VK_DEV_PORT) + API :$(API_PORT))"
	@echo "  make ngrok-vk-prod         — туннель на vk_prod (:$(VK_DOCKER_PORT))"
	@echo "  make vk-ngrok-hint         — подсказки .env / VK (ngrok :4040)"
	@echo "  make ngrok-max             — то же, что ngrok-max-prod (алиас)"
	@echo "  make ngrok-max-dev         — туннель на Vite MAX (:$(MAX_DEV_PORT))"
	@echo "  make ngrok-max-prod        — туннель на max_prod (:$(MAX_DOCKER_PORT))"
	@echo "  make ngrok-twa             — туннель на gateway :$(GATEWAY_PORT)"
	@echo "  make yookassa-webhook-url — URL вебхука ЮKassa после ngrok"
	@echo "  make pwa-dev / pwa-build   — PWA (Vite / build)"
	@echo "  make vk-dev / vk-build     — VK Mini App"
	@echo "  make max-dev / max-build   — MAX Mini App"
	@echo "  make seed / seed-clear     — демо-данные в БД"
	@echo ""
	@echo "Без Makefile:"
	@echo "  docker compose --env-file backend-develop/.env --profile dev up --build"

dev:
	$(COMPOSE) --profile dev up --build

dev-d:
	$(COMPOSE) --profile dev up --build -d

# Backend + PWA + VK (без Telegram TMA и без gateway). На VPS: nginx vhost-ы из deploy/nginx-host/ + certbot.
prod prod-nginx:
	$(COMPOSE) --profile prod up --build -d --scale frontend_prod=0 --scale gateway=0

# То же, но TLS в Docker (Caddy: два домена в deploy/caddy/Caddyfile).
prod-caddy:
	$(COMPOSE) --profile prod --profile caddy up --build -d --scale frontend_prod=0 --scale gateway=0

# Только VK + backend (без контейнера PWA).
prod-vk-nginx:
	$(COMPOSE) --profile prod up --build -d --scale frontend_prod=0 --scale gateway=0 --scale pwa_prod=0

prod-dns:
	$(COMPOSE) --profile prod --profile caddy --profile duckdns up --build -d --scale frontend_prod=0 --scale gateway=0

# TMA + PWA + VK + gateway :9190
prod-twa:
	$(COMPOSE) --profile prod up --build -d

down:
	$(COMPOSE) --profile dev --profile prod down --remove-orphans

stop-pwa:
	$(COMPOSE) --profile prod stop pwa_prod

stop-vk:
	$(COMPOSE) --profile prod stop vk_prod

stop-max:
	$(COMPOSE) --profile prod stop max_prod

start-pwa:
	$(COMPOSE) --profile prod start pwa_prod

start-vk:
	$(COMPOSE) --profile prod start vk_prod

start-max:
	$(COMPOSE) --profile prod start max_prod

logs:
	$(COMPOSE) --profile dev --profile prod logs -f

ngrok:
	ngrok http $(API_PORT)

ngrok-backend:
	ngrok http $(API_PORT)

ngrok-pwa:
	ngrok http $(PWA_PORT)

ngrok-vk: ngrok-vk-prod

ngrok-vk-prod:
	ngrok http $(VK_DOCKER_PORT)

ngrok-vk-local:
	@if [ -f "$$HOME/.config/ngrok/ngrok.yml" ]; then \
		ngrok start vk api --config "$$HOME/.config/ngrok/ngrok.yml" --config "$(CURDIR)/ngrok.vk-local.yml"; \
	elif [ -f "$$HOME/Library/Application Support/ngrok/ngrok.yml" ]; then \
		ngrok start vk api --config "$$HOME/Library/Application Support/ngrok/ngrok.yml" --config "$(CURDIR)/ngrok.vk-local.yml"; \
	else \
		echo "Подсказка: добавьте authtoken — ngrok config add-authtoken <token>"; \
		ngrok start vk api --config "$(CURDIR)/ngrok.vk-local.yml"; \
	fi

ngrok-vk-dev:
	ngrok http $(VK_DEV_PORT)

ngrok-max: ngrok-max-prod

ngrok-max-prod:
	ngrok http $(MAX_DOCKER_PORT)

ngrok-max-dev:
	ngrok http $(MAX_DEV_PORT)

vk-ngrok-hint:
	@VK_DEV_PORT='$(VK_DEV_PORT)' API_DEV_PORT='$(API_PORT)' VK_PROD_PORT='$(VK_DOCKER_PORT)' python3 scripts/vk-ngrok-hint.py

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

max-dev:
	cd apps/max && npm run dev

max-build:
	cd apps/max && npm run build

seed:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data

seed-clear:
	$(COMPOSE) --profile prod exec backend_prod python manage.py seed_data --clear
