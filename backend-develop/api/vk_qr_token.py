"""Статичный токен для QR мини-приложения ВК: один и тот же при неизменных trainer.uuid и зале."""

from __future__ import annotations

import hashlib
import hmac

from django.conf import settings

TOKEN_HEX_LEN = 24


def compute_vk_qr_token(trainer_uuid: str, gym_id: int) -> str:
	msg = f"{trainer_uuid}:{int(gym_id)}".encode("utf-8")
	key = (settings.SECRET_KEY or "").encode("utf-8")
	return hmac.new(key, msg, hashlib.sha256).hexdigest()[:TOKEN_HEX_LEN]


def build_vk_app_open_url(app_id: str | int, token: str, group_id: str | int | None = None) -> str:
	"""Ссылка для QR: app{id} или app{id}_-{group} + #токен тренажёра."""
	base = f"https://vk.com/app{app_id}"
	if group_id:
		base += f"_-{int(group_id)}"
	return f"{base}#{token}"


def lookup_vk_qr_trainer_gym(token: str) -> tuple[str, int] | None:
	if not token or len(token) != TOKEN_HEX_LEN:
		return None
	low = token.lower()
	if any(c not in "0123456789abcdef" for c in low):
		return None

	from api.models.QRCodeModel import QRCodeModel
	from api.models.SourceType import SourceType

	for row in QRCodeModel.objects.filter(source=SourceType.VK).select_related("trainer"):
		tr = row.trainer
		if tr is None:
			continue
		tid = getattr(tr, "uuid", None)
		if tid is None:
			continue
		tid_str = str(tid)
		gid = row.location_id
		cand = compute_vk_qr_token(tid_str, gid)
		if hmac.compare_digest(cand, low):
			return tid_str, int(gid)
	return None
