import logging
import time

_logger = logging.getLogger("sportachieve.request")


class RequestLoggingMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        started = time.monotonic()
        response = self.get_response(request)
        duration_ms = (time.monotonic() - started) * 1000.0
        _logger.info(
            "%s %s → %s (%.2f ms)",
            request.method,
            request.get_full_path(),
            getattr(response, "status_code", "?"),
            duration_ms,
        )
        return response
