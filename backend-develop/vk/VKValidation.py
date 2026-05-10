import base64
import hashlib
import hmac
import time
from typing import Optional
from urllib.parse import parse_qsl, urlencode

from vk.typed_dict import VKUser

# Maximum age of a VK launch_params token in seconds.
# Requests older than this are rejected as a replay-attack mitigation.
_MAX_PARAMS_AGE_SECONDS = 3600


class VKValidation:
    """Validates VK Mini App launch params.

    The algorithm follows the official VK documentation:
    https://dev.vk.com/ru/mini-apps/development/launch-params#Проверка-подписи

    Algorithm:
    1. Parse the raw query string (without leading '?').
    2. Keep only keys that start with 'vk_' (excluding 'sign').
    3. Sort the remaining pairs lexicographically by key.
    4. Build params_string = urlencode(sorted_pairs).
    5. Compute HMAC-SHA256(client_secret, params_string).
    6. Base64url-encode the digest (no padding, URL-safe alphabet).
    7. Compare with the 'sign' field via hmac.compare_digest (constant-time).
    8. Additionally check that vk_ts is not older than _MAX_PARAMS_AGE_SECONDS.
    """

    def __init__(self, client_secret: str) -> None:
        self._client_secret = client_secret

    def validate(self, launch_params: str) -> Optional[VKUser]:
        """Return a VKUser dict if launch_params are valid, otherwise None."""
        pairs = dict(parse_qsl(launch_params, keep_blank_values=True))

        sign = pairs.get("sign")
        if not sign:
            return None

        # Anti-replay: reject stale params
        vk_ts_raw = pairs.get("vk_ts")
        if vk_ts_raw is not None:
            try:
                vk_ts = int(vk_ts_raw)
                if time.time() - vk_ts > _MAX_PARAMS_AGE_SECONDS:
                    return None
            except ValueError:
                return None

        # Build the signable string from all vk_* keys (excluding 'sign')
        signable_pairs = sorted(
            (k, v) for k, v in pairs.items()
            if k.startswith("vk_") and k != "sign"
        )
        params_string = urlencode(signable_pairs)

        expected_sign = self._compute_sign(params_string)
        if not hmac.compare_digest(expected_sign, sign):
            return None

        vk_user_id_raw = pairs.get("vk_user_id")
        vk_app_id_raw = pairs.get("vk_app_id")
        try:
            return VKUser(
                vk_user_id=int(vk_user_id_raw or 0),
                vk_app_id=int(vk_app_id_raw or 0),
            )
        except (TypeError, ValueError):
            return None

    def _compute_sign(self, params_string: str) -> str:
        digest = hmac.new(
            self._client_secret.encode("utf-8"),
            params_string.encode("utf-8"),
            hashlib.sha256,
        ).digest()
        # Base64url without padding
        return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")
