#!/bin/bash
set -e

case "${1:-}" in
exec-health)
	shift
	exec "$@"
	;;
esac

python manage.py migrate --noinput

exec python manage.py "$@"
