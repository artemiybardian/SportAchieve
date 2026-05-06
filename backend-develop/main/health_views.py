import logging

import redis
from django.conf import settings
from django.db import connection
from django.http import JsonResponse
from django.views.decorators.http import require_GET


logger = logging.getLogger(__name__)


@require_GET
def health_live(request):
	"""Процесс поднят и отвечает (без проверки зависимостей)."""
	return JsonResponse({"status": "ok"})


@require_GET
def health_ready(request):
	"""База и брокер Redis (Celery), без которых бэкенд считается неготовым."""
	checks = {"db": "pending", "redis": "skipped"}

	try:
		connection.ensure_connection()
		with connection.cursor() as cursor:
			cursor.execute("SELECT 1")
		checks["db"] = "ok"
	except Exception as exc:
		logger.warning("Health ready: DB check failed: %s", exc, exc_info=True)
		checks["db"] = "fail"

	broker_url = getattr(settings, "CELERY_BROKER_URL", None) or ""
	if broker_url:
		try:
			redis.Redis.from_url(broker_url).ping()
			checks["redis"] = "ok"
		except Exception as exc:
			logger.warning("Health ready: Redis check failed: %s", exc, exc_info=True)
			checks["redis"] = "fail"
	else:
		checks["redis"] = "skipped"

	if checks["db"] != "ok" or checks["redis"] == "fail":
		return JsonResponse({"status": "unhealthy", "checks": checks}, status=503)
	return JsonResponse({"status": "ok", "checks": checks})
