from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.utils.timezone import now

from api.models.SourceType import SourceType
from main.utils import get_logger
from telegram.typed_dict import TelegramUser as TelegramUserDict

User = get_user_model()


class UserService:
	logger = get_logger(__name__)

	def register(self, email: str, password: str, first_name: str = "", last_name: str = "") -> User:
		if User.objects.filter(email=email).exists():
			raise ValueError("User with this email already exists")
		username = email.split("@")[0]
		base_username = username
		counter = 1
		while User.objects.filter(username=username).exists():
			username = f"{base_username}{counter}"
			counter += 1
		user = User.objects.create(
			username=username,
			email=email,
			first_name=first_name,
			last_name=last_name,
			password=make_password(password),
			last_login=now(),
			source=SourceType.SITE,
		)
		self.logger.debug(f"User registered with email ({email})")
		return user

	def login_by_email(self, email: str, password: str) -> User | None:
		try:
			user = User.objects.get(email=email)
		except User.DoesNotExist:
			return None
		if not check_password(password, user.password):
			return None
		user.last_login = now()
		user.save(update_fields=["last_login"])
		return user

	def save_if_not_exist(self, user: TelegramUserDict) -> User:
		username = user.get("username") or f"user_{user['id']}"
		
		db_user, created = User.objects.get_or_create(
			username=username,
			defaults={
				"id": user["id"],
				"username": user["username"],
				"first_name": user.get("first_name", ""),
				"last_name": user.get("last_name", ""),
				"profile_photo": user.get("photo_url", None),
				"last_login": now(),
				"source": SourceType.TELEGRAM,
			}
		)
		if created:
			self.logger.debug(f"User created from telegram ({user})")
		else:
			db_user.last_login = now()
			db_user.save()
		
		return db_user
