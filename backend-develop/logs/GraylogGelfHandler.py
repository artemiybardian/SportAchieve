import json
import logging
import socket
import time
import traceback
import threading
from typing import Optional, Dict, Any

import requests
from django.core.handlers.wsgi import WSGIRequest


class GraylogGelfHandler(logging.Handler):
    """
    Python logging handler that sends records to Graylog via GELF HTTP input.
    Designed to NEVER break your app if Graylog is down.
    """

    # Python logging -> syslog-like numeric levels commonly used by GELF
    # (GELF "level" is usually syslog levels: 0..7)
    PY_TO_GELF_LEVEL = {
        logging.CRITICAL: 2,  # Critical
        logging.ERROR: 3,     # Error
        logging.WARNING: 4,   # Warning
        logging.INFO: 6,      # Informational
        logging.DEBUG: 7,     # Debug
    }

    def __init__(
        self,
        endpoint: str,
        service: str,
        env: str,
        host: Optional[str] = None,
        timeout: float = 2.0,
        static_extra: Optional[Dict[str, Any]] = None,
    ):
        super().__init__()
        self.endpoint = endpoint
        self.service = service
        self.env = env
        self.host = host or socket.gethostname()
        self.timeout = timeout
        self.static_extra = static_extra or {}

    def _to_gelf_level(self, record_levelno: int) -> int:
        # Map to nearest known level; default INFO
        for py_level, gelf_level in sorted(self.PY_TO_GELF_LEVEL.items(), reverse=True):
            if record_levelno >= py_level:
                return gelf_level
        return 6

    @staticmethod
    def _normalize_extra(extra: Dict[str, Any]) -> Dict[str, Any]:
        out: Dict[str, Any] = {}
        for k, v in extra.items():
            if k.startswith("_"):
                out[k] = v
            else:
                out[f"_{k}"] = v
        return out

    def _extract_record_extras(self, record: logging.LogRecord) -> Dict[str, Any]:
        """
        Collect custom extras added via logger.*(..., extra={...})
        but ignore standard LogRecord fields.
        """
        standard = {
            "name", "msg", "args", "levelname", "levelno", "pathname", "filename",
            "module", "exc_info", "exc_text", "lineno", "funcName",
            "created", "msecs", "relativeCreated", "thread", "threadName",
            "processName", "process", "message",
        }

        extras = {k: v for k, v in record.__dict__.items() if k not in standard}
        return extras

    def emit(self, record: logging.LogRecord) -> None:
        try:
            # Ensure record.message exists
            message = record.getMessage()

            short_message = message
            full_message = message
            
            if record.exc_info:
                exc_text = "".join(traceback.format_exception(*record.exc_info))
                full_message = f"{message}\n{exc_text}"

            payload: Dict[str, Any] = {
                "version": "1.1",
                "host": self.host,
                "short_message": short_message,
                "full_message": full_message,
                "timestamp": getattr(record, "created", time.time()),
                "level": self._to_gelf_level(record.levelno),
                "_service": self.service,
                "_env": self.env,
                "_logger": record.name,
                "_module": record.module,
                "_func": record.funcName,
                "_line": record.lineno,
                "_process": record.process,
                "_thread": record.thread,
            }

            record_extras = self._extract_record_extras(record)
            merged_extra = {**self.static_extra, **record_extras}
            payload.update(self._normalize_extra(merged_extra))
            
            _request = payload.get('_request', None)
            if type(_request) is WSGIRequest:
                payload.pop("_request")
                try:
                    if hasattr(_request, "_body"):
                        _body = str(_request._body)
                    elif getattr(_request, "_read_started", False):
                        _body = "[ALREADY READ FROM STREAM]"
                    else:
                        _body = str(_request.body)
                except Exception as e:
                    traceback.print_exception(e)
                    _body = ""
                payload.update({
                    "_request": {
                        "headers": dict(_request.headers),
                        "body": _body
                    }
                })

            # Run POST in background thread
            threading.Thread(
                target=self._send_gelf,
                args=(payload,),
                daemon=True
            ).start()
        except Exception as e:
            traceback.print_exception(e)
            # never let logging crash the app
            self.handleError(record)

    def _send_gelf(self, payload: Dict[str, Any]) -> None:
        if not self.endpoint:
            return
        try:
            requests.post(
                self.endpoint,
                data=json.dumps(payload, default=str),
                timeout=self.timeout,
                headers={"Content-Type": "application/json"},
            )
        except Exception as e:
            traceback.print_exception(e)
