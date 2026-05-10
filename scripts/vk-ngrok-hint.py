#!/usr/bin/env python3
"""
Подсказки для теста VK Mini App только через ngrok (без duckdns).

Режимы:
  • Прод (Docker vk_prod): один HTTPS-туннель на порт 3162 — nginx отдаёт фронт и проксирует /api.
  • Дев: два туннеля — Vite VK :5175 и Django :8160 (make ngrok-vk-local).
"""
import json
import os
import sys
import urllib.error
import urllib.request
from urllib.parse import urlparse

NGROK_API = "http://127.0.0.1:4040/api/tunnels"
VK_DEV_PORT = os.environ.get("VK_DEV_PORT", "5175")
API_DEV_PORT = os.environ.get("API_DEV_PORT", "8160")
VK_PROD_PORT = os.environ.get("VK_PROD_PORT", "3162")


def _host(url: str) -> str:
    try:
        h = urlparse(url).hostname
        return h or ""
    except ValueError:
        return ""


def _collect_by_port(tunnels: list) -> dict[str, str]:
    by_port: dict[str, str] = {}
    for port in (VK_PROD_PORT, VK_DEV_PORT, API_DEV_PORT):
        by_port.setdefault(port, "")
    for t in tunnels:
        if t.get("proto") != "https":
            continue
        pub = (t.get("public_url") or "").rstrip("/")
        cfg = t.get("config", {}) or {}
        addr = str(cfg.get("addr", "") or "")
        for port in (VK_PROD_PORT, VK_DEV_PORT, API_DEV_PORT):
            if f":{port}" in addr or addr.endswith(port):
                by_port[port] = pub
    return by_port


def _print_prod(public_base: str) -> None:
    h = _host(public_base)
    print()
    print("=== VK Mini App + ngrok: ПРОД (Docker vk_prod на :" + VK_PROD_PORT + ") ===")
    print()
    print("Один туннель: статика и /api с одного HTTPS (nginx внутри контейнера vk).")
    print()
    print("1) Кабинет VK → доверенный URL:")
    print(f"   {public_base}/")
    print()
    print("2) backend-develop/.env → перезапуск backend_prod:")
    print(f"   VK_APP_BASE_URL={public_base}")
    print("   Добавьте в ALLOWED_HOSTS хост туннеля (Django получает его в Host при прокси из vk-nginx):")
    print(f"   {h}")
    print()
    print("3) Пересборка vk_prod не нужна ради API: образ уже с VITE_API_BASE_URL= (относительные /api/...).")
    print("   VK_APP_ID при сборке: задайте в .env для docker compose (см. compose).")
    print()
    print("4) Вебхук ЮKassa:")
    print(f"   {public_base}/api/yookasa/log   (+ YOOKASSA_SECRET_PATH из .env, если задан)")
    print()


def _print_dev(front: str, api_base: str) -> None:
    api_host = _host(api_base)
    print()
    print("=== VK Mini App + ngrok: ДЕВ (Vite + Django отдельно) ===")
    print()
    print("1) Кабинет VK → доверенный URL:")
    print(f"   {front}/")
    print()
    print("2) backend-develop/.env (перезапустите Django):")
    print(f"   VK_APP_BASE_URL={front}")
    print("   Добавьте в ALLOWED_HOSTS хост API-туннеля (без https://):")
    print(f"   {api_host}")
    print()
    print("   CORS: VK_APP_BASE_URL подмешивается в settings.py.")
    print()
    print("3) apps/vk/.env → перезапуск make vk-dev:")
    print(f"   VITE_API_BASE_URL={api_base}")
    print("   VITE_VK_APP_ID=<ваш числовой ID из кабинета VK>")
    print()
    print("4) Вебхук ЮKassa:")
    print(f"   {api_base}/api/yookasa/log   (+ YOOKASSA_SECRET_PATH из .env, если задан)")
    print()


def main() -> int:
    try:
        with urllib.request.urlopen(NGROK_API, timeout=3) as r:
            data = json.load(r)
    except OSError as e:
        print("Не удалось подключиться к ngrok (http://127.0.0.1:4040).", file=sys.stderr)
        print("  Прод: make ngrok-vk-prod  |  Дев: make ngrok-vk-local", file=sys.stderr)
        print(e, file=sys.stderr)
        return 1

    tunnels = data.get("tunnels", [])
    by_port = _collect_by_port(tunnels)

    prod_url = by_port.get(VK_PROD_PORT, "")
    front = by_port.get(VK_DEV_PORT, "")
    api_base = by_port.get(API_DEV_PORT, "")

    if prod_url:
        _print_prod(prod_url)
        return 0

    if front and api_base:
        _print_dev(front, api_base)
        return 0

    print("Не найден подходящий туннель в ngrok.", file=sys.stderr)
    print(file=sys.stderr)
    print("  ПРОД: поднимите профиль prod с vk_prod (:3162), затем:", file=sys.stderr)
    print("    make ngrok-vk-prod", file=sys.stderr)
    print(file=sys.stderr)
    print("  ДЕВ: make vk-dev + Django :8160, затем:", file=sys.stderr)
    print("    make ngrok-vk-local", file=sys.stderr)
    print(file=sys.stderr)
    for t in tunnels:
        if t.get("proto") == "https":
            cfg = t.get("config", {}) or {}
            print(f"  - {t.get('public_url')} → {cfg.get('addr')}", file=sys.stderr)
    return 1


if __name__ == "__main__":
    raise SystemExit(main())
