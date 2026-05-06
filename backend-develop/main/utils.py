

import logging
import os
from main.settings import BASE_DIR


def get_logger(name: str):
	logger = logging.getLogger(name)
	logger.setLevel(logging.DEBUG)

	if not logger.handlers:
		formatter = logging.Formatter('%(asctime)s | %(name)s | %(levelname)s | %(message)s')

		# Console handler
		ch = logging.StreamHandler()
		ch.setLevel(logging.DEBUG)
		ch.setFormatter(formatter)
		logger.addHandler(ch)

		# File handler
		log_file = os.path.join(BASE_DIR, 'app.log')
		fh = logging.FileHandler(log_file)
		fh.setLevel(logging.DEBUG)
		fh.setFormatter(formatter)
		logger.addHandler(fh)

	return logger


def build_absolute_uri(request, url):
	if not url:
		return None
	if hasattr(url, 'url'):
		url = url.url
	uri = request.build_absolute_uri(url)
	if os.getenv("FORCE_HTTPS_URLS", "False").lower() in ("true", "1", "yes"):
		uri = uri.replace("http://", "https://", 1)
	return uri
