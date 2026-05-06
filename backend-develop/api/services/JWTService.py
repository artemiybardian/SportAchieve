import time
import jwt


class JWTService:
	
	def __init__(self, secret: str, token_life_in_seconds: int = 86400):
		self._secret = secret
		self._token_life_in_seconds = token_life_in_seconds
	
	def issue(self, payload: dict) -> str:
		payload["exp"] = int(time.time()) + self._token_life_in_seconds
		return jwt.encode(payload, self._secret, algorithm="HS256")
	
	def is_valid(self, token: str) -> bool:
		try:
			jwt.decode(token, self._secret, algorithms=["HS256"])
			return True
		except jwt.PyJWTError:
			return False
	
	def body(self, token: str) -> dict:
		return jwt.decode(token, self._secret, algorithms=["HS256"])
