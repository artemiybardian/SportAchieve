#!/usr/bin/env python3
"""Вывод полного HTTPS URL для вебхука ЮKassa по локальному API ngrok (:4040)."""
import json
import sys
import urllib.error
import urllib.request

URL = "http://127.0.0.1:4040/api/tunnels"
PATH_SUFFIX = "/api/yookasa/log"


def main() -> int:
    try:
        with urllib.request.urlopen(URL, timeout=3) as r:
            d = json.load(r)
    except OSError:
        print("Поднимите ngrok: make ngrok", file=sys.stderr)
        return 1
    urls = [
        t["public_url"].rstrip("/")
        for t in d.get("tunnels", [])
        if t.get("proto") == "https"
    ]
    if not urls:
        print("В ответе ngrok нет HTTPS URL. Запустите: make ngrok", file=sys.stderr)
        return 1
    print(urls[0] + PATH_SUFFIX)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
