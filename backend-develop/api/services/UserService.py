from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import make_password, check_password
from django.utils.timezone import now

from api.models.SourceType import SourceType
from main.utils import get_logger
from max.typed_dict import MAXUser as MAXUserDict
from telegram.typed_dict import TelegramUser as TelegramUserDict
from vk.typed_dict import VKUser as VKUserDict

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
			is_onboarding_complete=False,
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

	def save_if_not_exist_vk(self, vk_user: VKUserDict) -> User:
		vk_user_id = vk_user["vk_user_id"]
		db_user, created = User.objects.get_or_create(
			vk_id=vk_user_id,
			defaults={
				"username": f"vk_{vk_user_id}",
				"last_login": now(),
				"source": SourceType.VK,
				"is_onboarding_complete": False,
			}
		)
		if not created:
			db_user.last_login = now()
			db_user.save(update_fields=["last_login"])
		else:
			self.logger.debug(f"User created from VK ({vk_user_id})")
		return db_user

	def save_if_not_exist_max(self, max_user: MAXUserDict) -> User:
		max_user_id = max_user["max_user_id"]
		db_user, created = User.objects.get_or_create(
			max_id=max_user_id,
			defaults={
				"username": f"max_{max_user_id}",
				"first_name": max_user.get("first_name", ""),
				"last_name": max_user.get("last_name", ""),
				"profile_photo": max_user.get("photo_url") or None,
				"last_login": now(),
				"source": SourceType.MAX,
				"is_onboarding_complete": False,
			}
		)
		if not created:
			db_user.last_login = now()
			db_user.save(update_fields=["last_login"])
		else:
			self.logger.debug(f"User created from MAX ({max_user_id})")
		return db_user

	def apply_max_bridge_profile(
		self,
		user: User,
		*,
		first_name: str,
		last_name: str,
		profile_photo: str | None,
	) -> None:
		if user.max_id is None:
			raise ValueError("not_max_user")
		update_fields: list[str] = []
		fn = (first_name or "").strip()
		ln = (last_name or "").strip()
		if fn != user.first_name:
			user.first_name = fn
			update_fields.append("first_name")
		if ln != user.last_name:
			user.last_name = ln
			update_fields.append("last_name")
		photo = ((profile_photo or "").strip() or None)
		if photo != (user.profile_photo or None):
			user.profile_photo = photo
			update_fields.append("profile_photo")
		if update_fields:
			user.save(update_fields=update_fields)

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
				"is_onboarding_complete": False,
			}
		)
		if created:
			self.logger.debug(f"User created from telegram ({user})")
		else:
			db_user.last_login = now()
			db_user.save()
		
		return db_user

	def apply_vk_bridge_profile(
		self,
		user: User,
		*,
		first_name: str,
		last_name: str,
		profile_photo: str | None,
	) -> None:
		if user.vk_id is None:
			raise ValueError("not_vk_user")
		update_fields: list[str] = []
		fn = (first_name or "").strip()
		ln = (last_name or "").strip()
		if fn != user.first_name:
			user.first_name = fn
			update_fields.append("first_name")
		if ln != user.last_name:
			user.last_name = ln
			update_fields.append("last_name")
		photo = ((profile_photo or "").strip() or None)
		if photo != (user.profile_photo or None):
			user.profile_photo = photo
			update_fields.append("profile_photo")
		if update_fields:
			user.save(update_fields=update_fields)
