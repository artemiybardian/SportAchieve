import logging
import os

from logs.GraylogGelfHandler import GraylogGelfHandler


def get_logger(name: str, service: str = ""):
    logger = logging.getLogger(name)
    
    log_level = os.getenv("LOG_LEVEL", "DEBUG").upper()
    level = logging._nameToLevel.get(log_level)
    logger.setLevel(level)
    

    # Graylog HTTP Handler
    graylog_endpoint = os.getenv("GRAYLOG_ENDPOINT")
    
    graylog = GraylogGelfHandler(
        endpoint=graylog_endpoint,
        service=service,
        env=os.environ.get("ENVIRONMENT", "dev"),
        static_extra={"app": service},
        host=os.environ.get("HOSTNAME", None)
    )
    
    logger.addHandler(graylog)
    return logger
