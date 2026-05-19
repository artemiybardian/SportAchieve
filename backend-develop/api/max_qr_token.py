"""Статичный токен для QR мини-приложения MAX: один и тот же при неизменных trainer.uuid и зале."""

from __future__ import annotations

import hashlib
import hmac

from django.conf import settings

TOKEN_HEX_LEN = 24


def compute_max_qr_token(trainer_uuid: str, gym_id: int) -> str:
	msg = f"{trainer_uuid}:{int(gym_id)}".encode("utf-8")
	key = (settings.SECRET_KEY or "").encode("utf-8")
	return hmac.new(key, msg, hashlib.sha256).hexdigest()[:TOKEN_HEX_LEN]


def lookup_max_qr_trainer_gym(token: str) -> tuple[str, int] | None:
	if not token or len(token) != TOKEN_HEX_LEN:
		return None
	low = token.lower()
	if any(c not in "0123456789abcdef" for c in low):
		return None

	from api.models.QRCodeModel import QRCodeModel
	from api.models.SourceType import SourceType

	for row in QRCodeModel.objects.filter(source=SourceType.MAX).select_related("trainer"):
		tr = row.trainer
		if tr is None:
			continue
		tid = getattr(tr, "uuid", None)
		if tid is None:
			continue
		tid_str = str(tid)
		gid = row.location_id
		cand = compute_max_qr_token(tid_str, gid)
		if hmac.compare_digest(cand, low):
			return tid_str, int(gid)
	return None
