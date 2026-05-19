import hashlib
import hmac
import json
import time
from typing import Optional
from urllib.parse import unquote

from max.typed_dict import MAXUser

# Maximum age of MAX init_data in seconds.
_MAX_PARAMS_AGE_SECONDS = 3600


class MaxValidation:
	"""Validates MAX Mini App WebAppData (init_data string).

	Algorithm per MAX developer documentation:
	  1. Split WebAppData by '&' into key=value pairs.
	  2. URL-decode all values.
	  3. Extract and remove the 'hash' key; keep original for comparison.
	  4. Sort remaining pairs alphabetically by key (a → z).
	  5. Build launch_params = "\\n".join(f"{k}={v}").
	  6. secret_key = HMAC-SHA256(key=b"WebAppData", msg=BOT_TOKEN.encode())
	  7. computed_hash = hex(HMAC-SHA256(key=secret_key, msg=launch_params.encode()))
	  8. hmac.compare_digest(computed_hash, original_hash)
	"""

	def __init__(self, bot_token: str) -> None:
		self._bot_token = bot_token

	def validate(self, init_data: str) -> Optional[MAXUser]:
		"""Return a MAXUser if init_data is valid, otherwise None."""
		if not init_data or not self._bot_token:
			return None

		pairs: list[tuple[str, str]] = []
		for part in init_data.split("&"):
			if "=" not in part:
				continue
			k, _, v = part.partition("=")
			pairs.append((k, unquote(v)))

		hash_values = [v for k, v in pairs if k == "hash"]
		if len(hash_values) != 1:
			return None
		original_hash = hash_values[0]

		filtered = [(k, v) for k, v in pairs if k != "hash"]

		# Anti-replay: reject stale init_data
		auth_date_values = [v for k, v in filtered if k == "auth_date"]
		if auth_date_values:
			try:
				auth_date = int(auth_date_values[0])
				if time.time() - auth_date > _MAX_PARAMS_AGE_SECONDS:
					return None
			except ValueError:
				return None

		filtered.sort(key=lambda x: x[0])
		launch_params = "\n".join(f"{k}={v}" for k, v in filtered)

		computed = self._compute_hash(launch_params)
		if not hmac.compare_digest(computed, original_hash):
			return None

		user_values = [v for k, v in filtered if k == "user"]
		if not user_values:
			return None

		try:
			user_obj = json.loads(user_values[0])
			return MAXUser(
				max_user_id=int(user_obj["id"]),
				first_name=str(user_obj.get("first_name", "")),
				last_name=str(user_obj.get("last_name", "")),
				username=user_obj.get("username") or None,
				photo_url=user_obj.get("photo_url") or None,
			)
		except (KeyError, ValueError, TypeError):
			return None

	def _compute_hash(self, launch_params: str) -> str:
		secret_key = hmac.new(
			b"WebAppData",
			self._bot_token.encode("utf-8"),
			hashlib.sha256,
		).digest()
		return hmac.new(
			secret_key,
			launch_params.encode("utf-8"),
			hashlib.sha256,
		).hexdigest()
