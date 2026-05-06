#!/bin/sh
set -eu

# gosu из пакета debian: sid/compatibility
GOSU=/usr/sbin/gosu
[ -x "$GOSU" ] || GOSU=/usr/bin/gosu
[ -x "$GOSU" ] || {
  echo "gosu not found (expected /usr/sbin/gosu). Rebuild backend image." >&2
  exit 1
}

# Под root из compose: владелец тома с медиа, дальше процессы от appuser.
chown -R appuser:appuser /app/files

"$GOSU" appuser python manage.py collectstatic --noinput

exec "$GOSU" appuser gunicorn --bind 0.0.0.0:8000 --workers 3 main.wsgi:application
