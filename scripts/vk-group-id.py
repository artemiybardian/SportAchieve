#!/usr/bin/env python3
"""
Получить числовой ID сообщества ВКонтакте по ссылке или короткому имени.

Нужен ключ доступа сообщества (Управление → Работа с API → Создать ключ),
не сервисный ключ мини-приложения и не защищённый ключ.

Примеры:
  python3 scripts/vk-group-id.py sportachieve
  python3 scripts/vk-group-id.py https://vk.com/sportachieve
  python3 scripts/vk-group-id.py --env-file backend-develop/.env sportachieve

Переменные окружения:
  VK_COMMUNITY_ACCESS_TOKEN — ключ vk1.a… или legacy hex из «Работа с API»
  VK_APP_ID — для вывода ссылки vk.com/app{APP_ID}_-{group_id}
"""
from __future__ import annotations

import argparse
import json
import os
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

VK_API = "https://api.vk.com/method"
DEFAULT_API_VERSION = "5.199"


def _load_dotenv(path: str) -> None:
    if not path or not os.path.isfile(path):
        return
    with open(path, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, _, value = line.partition("=")
            key = key.strip()
            value = value.strip().strip('"').strip("'")
            if key and key not in os.environ:
                os.environ[key] = value


def _parse_group_ref(raw: str) -> str:
    """club123 / public123 / screen name / URL → id or screen_name for API."""
    s = raw.strip()
    m = re.search(
        r"(?:vk\.com|vk\.ru)/(?:club|public|event)?(\d+)|"
        r"(?:vk\.com|vk\.ru)/([A-Za-z0-9_.-]+)",
        s,
        re.I,
    )
    if m:
        if m.group(1):
            return m.group(1)
        slug = m.group(2)
        if slug.lower() not in ("app", "apps", "id", "away", "join"):
            return slug
    if re.fullmatch(r"\d+", s):
        return s
    return s.lstrip("@/")


def _vk_call(method: str, token: str, params: dict, version: str) -> dict:
    q = {**params, "access_token": token, "v": version}
    url = f"{VK_API}/{method}?{urllib.parse.urlencode(q)}"
    req = urllib.request.Request(url, headers={"User-Agent": "SportAchieve/vk-group-id"})
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as e:
        body = json.loads(e.read().decode("utf-8"))
    if "error" in body:
        err = body["error"]
        code = err.get("error_code", "?")
        msg = err.get("error_msg", err)
        raise RuntimeError(f"VK API {method}: [{code}] {msg}")
    return body.get("response", body)


def _resolve_screen_name(token: str, screen_name: str, version: str) -> dict | None:
    resp = _vk_call(
        "utils.resolveScreenName",
        token,
        {"screen_name": screen_name},
        version,
    )
    if not resp:
        return None
    if resp.get("type") != "group" and resp.get("type") != "page":
        raise RuntimeError(
            f"«{screen_name}» — это {resp.get('type')}, не сообщество "
            f"(object_id={resp.get('object_id')})"
        )
    return resp


def _groups_get_by_id(token: str, group_ref: str, version: str) -> dict | None:
    resp = _vk_call(
        "groups.getById",
        token,
        {"group_id": group_ref, "fields": "screen_name"},
        version,
    )
    if isinstance(resp, dict) and "groups" in resp:
        groups = resp["groups"]
    elif isinstance(resp, list):
        groups = resp
    else:
        groups = []
    return groups[0] if groups else None


def resolve_group_id(token: str, group_ref: str, version: str) -> dict:
    ref = _parse_group_ref(group_ref)
    if not ref:
        raise ValueError("Пустая ссылка или имя сообщества")

    if re.fullmatch(r"\d+", ref):
        row = _groups_get_by_id(token, ref, version)
        if row:
            return {
                "id": int(row["id"]),
                "screen_name": row.get("screen_name"),
                "name": row.get("name"),
                "method": "groups.getById",
            }
        return {"id": int(ref), "screen_name": None, "name": None, "method": "numeric"}

    row = _groups_get_by_id(token, ref, version)
    if row:
        return {
            "id": int(row["id"]),
            "screen_name": row.get("screen_name"),
            "name": row.get("name"),
            "method": "groups.getById",
        }

    resolved = _resolve_screen_name(token, ref, version)
    if resolved:
        gid = int(resolved["object_id"])
        row = _groups_get_by_id(token, str(gid), version) or {}
        return {
            "id": gid,
            "screen_name": row.get("screen_name") or ref,
            "name": row.get("name"),
            "method": "utils.resolveScreenName",
        }

    raise RuntimeError(f"Сообщество не найдено: {group_ref!r} (разобрано как {ref!r})")


def main() -> int:
    parser = argparse.ArgumentParser(description="ID сообщества VK по ссылке или short name")
    parser.add_argument(
        "group",
        nargs="?",
        default="sportachieve",
        help="URL, club123, public123, short name (по умолчанию sportachieve)",
    )
    parser.add_argument(
        "--token",
        help="Ключ доступа сообщества (иначе VK_COMMUNITY_ACCESS_TOKEN из env)",
    )
    parser.add_argument(
        "--env-file",
        default="backend-develop/.env",
        help="Подгрузить переменные из .env (по умолчанию backend-develop/.env)",
    )
    parser.add_argument("--api-version", default=DEFAULT_API_VERSION)
    args = parser.parse_args()

    _load_dotenv(args.env_file)
    token = (args.token or os.environ.get("VK_COMMUNITY_ACCESS_TOKEN") or "").strip()
    if not token:
        print(
            "Нужен ключ сообщества (vk1.a… из Управление → Работа с API).\n"
            "Задайте VK_COMMUNITY_ACCESS_TOKEN в .env или --token=…\n"
            "Сервисный ключ мини-приложения (VK_SERVICE_TOKEN) обычно не подходит.",
            file=sys.stderr,
        )
        return 1

    try:
        info = resolve_group_id(token, args.group, args.api_version)
    except (RuntimeError, ValueError, urllib.error.URLError) as e:
        print(f"Ошибка: {e}", file=sys.stderr)
        return 1

    gid = info["id"]
    app_id = (os.environ.get("VK_APP_ID") or "").strip()

    print(f"group_id (для ссылки app…_-ID): {gid}")
    print(f"group_id для API (отрицательный): {-gid}")
    if info.get("screen_name"):
        print(f"screen_name: {info['screen_name']}")
    if info.get("name"):
        print(f"name: {info['name']}")
    print(f"method: {info['method']}")
    if app_id:
        print(f"app_in_group_url: https://vk.com/app{app_id}_-{gid}")
    else:
        print("app_in_group_url: задайте VK_APP_ID в .env для полной ссылки")

    return 0


if __name__ == "__main__":
    sys.exit(main())
