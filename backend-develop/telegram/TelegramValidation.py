import hashlib
import hmac
import json
from typing import Optional
from urllib.parse import unquote

from telegram.typed_dict import TelegramUser, InitData


class TelegramValidation:
	
	def __init__(self, telegram_bot_token: str):
		self._TELEGRAM_BOT_TOKEN = telegram_bot_token
	
	def validate_init_data(self, init_data: str) -> Optional[TelegramUser]:
		# Telegram Mini App initData can be passed in various states of encoding.
		# We need to find the part that contains the signed data.
		
		current_data = str(init_data)
		parsed_data = {}
		found_level = current_data
		
		# Attempt to find a valid hash and user field by unquoting up to 4 times.
		# Many wrappers or transports double/triple encode the initData string.
		for _ in range(4):
			# If the string contains '&' and '=', it's likely a query string.
			if "&" in current_data and "=" in current_data:
				try:
					potential_parsed = {item.split("=")[0]: item.split("=")[1] for item in current_data.split("&") if "=" in item}
					if "hash" in potential_parsed:
						parsed_data = potential_parsed
						found_level = current_data
						# If we have both hash and user, we've likely found the right level.
						if "user" in parsed_data:
							break
				except Exception:
					pass
			
			next_data = unquote(current_data)
			if next_data == current_data:
				break
			current_data = next_data
		
		if "hash" not in parsed_data:
			return None

		hash_str = parsed_data.pop("hash")
		
		# Filter out tgWebApp* fields as they are not part of the signature
		# but might be appended by the client library or a wrapper.
		signable_data = {k: v for k, v in parsed_data.items() if not k.startswith("tgWebApp")}
		
		# The data-check-string is a list of all received fields, 
		# sorted alphabetically, in the format key=<value> 
		# with a newline character ('\n', 0x0A) used as separator.
		
		# IMPORTANT: Telegram expects the values to be the same as in the 
		# URL query string (URL-decoded once from the full string).
		# In Python's split and dict creation above, 'v' is already URL-decoded
		# if current_data was the raw query string. 
		# HOWEVER, if current_data itself was already unquoted, 'v' is further unquoted.
		# We need 'v' to be what it would be in a standard URL query string.
		
		# Let's re-parse from 'found_level' to be sure we have the right values.
		# A standard way to parse query strings and keep values as they are
		# (after the first level of unquoting by the parser) is what we need.
		from urllib.parse import parse_qsl
		items = parse_qsl(found_level, keep_blank_values=True)
		signable_items = sorted([(k, v) for k, v in items if k != "hash" and not k.startswith("tgWebApp")])
		
		init_data_string = "\n".join(f"{k}={v}" for k, v in signable_items)
		
		secret_key = hmac.new("WebAppData".encode(), self._TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
		data_check = hmac.new(secret_key, init_data_string.encode(), hashlib.sha256)
		
		is_valid = data_check.hexdigest() == hash_str
		
		if is_valid:
			try:
				# Find the user item in our signable_items
				user_val = next((v for k, v in signable_items if k == "user"), "{}")
				user_dict = json.loads(user_val)
				return TelegramUser(**user_dict)
			except (json.JSONDecodeError, TypeError, KeyError):
				return None
		return None
