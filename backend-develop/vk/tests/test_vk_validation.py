import base64
import hashlib
import hmac
import time
import unittest
from urllib.parse import urlencode

from vk.VKValidation import VKValidation

_SECRET = "test_client_secret"


def _make_sign(params_string: str, secret: str = _SECRET) -> str:
    digest = hmac.new(secret.encode(), params_string.encode(), hashlib.sha256).digest()
    return base64.urlsafe_b64encode(digest).rstrip(b"=").decode("ascii")


def _build_launch_params(
    vk_user_id: int = 123,
    vk_app_id: int = 456,
    extra: dict | None = None,
    secret: str = _SECRET,
    ts_offset: int = 0,
) -> str:
    vk_ts = int(time.time()) + ts_offset
    base_pairs = [
        ("vk_app_id", str(vk_app_id)),
        ("vk_ts", str(vk_ts)),
        ("vk_user_id", str(vk_user_id)),
    ]
    if extra:
        base_pairs.extend(sorted(extra.items()))
    signable_pairs = sorted(base_pairs)
    params_string = urlencode(signable_pairs)
    sign = _make_sign(params_string, secret=secret)
    return params_string + "&sign=" + sign


class TestVKValidation(unittest.TestCase):
    def setUp(self):
        self.validator = VKValidation(client_secret=_SECRET)

    def test_valid_params_returns_user(self):
        params = _build_launch_params(vk_user_id=42, vk_app_id=100)
        result = self.validator.validate(params)
        self.assertIsNotNone(result)
        self.assertEqual(result["vk_user_id"], 42)
        self.assertEqual(result["vk_app_id"], 100)

    def test_tampered_sign_returns_none(self):
        params = _build_launch_params()
        # Corrupt the sign
        tampered = params[:-4] + "XXXX"
        self.assertIsNone(self.validator.validate(tampered))

    def test_missing_sign_returns_none(self):
        params = _build_launch_params()
        # Remove sign
        without_sign = "&".join(p for p in params.split("&") if not p.startswith("sign="))
        self.assertIsNone(self.validator.validate(without_sign))

    def test_stale_params_returns_none(self):
        # vk_ts one hour and one second in the past
        params = _build_launch_params(ts_offset=-(3600 + 1))
        self.assertIsNone(self.validator.validate(params))

    def test_wrong_secret_returns_none(self):
        params = _build_launch_params(secret="wrong_secret")
        self.assertIsNone(self.validator.validate(params))

    def test_extra_non_vk_params_are_ignored_in_sign(self):
        # non-vk_ params must not affect the signature (they are excluded)
        vk_ts = int(time.time())
        signable_pairs = sorted([
            ("vk_app_id", "456"),
            ("vk_ts", str(vk_ts)),
            ("vk_user_id", "123"),
        ])
        params_string = urlencode(signable_pairs)
        sign = _make_sign(params_string)
        # add an extra non-vk_ param after sign
        full_params = params_string + "&sign=" + sign + "&utm_source=test"
        result = self.validator.validate(full_params)
        self.assertIsNotNone(result)

    def test_empty_string_returns_none(self):
        self.assertIsNone(self.validator.validate(""))

    def test_malformed_vk_ts_returns_none(self):
        vk_ts = int(time.time())
        signable_pairs = sorted([
            ("vk_app_id", "456"),
            ("vk_ts", str(vk_ts)),
            ("vk_user_id", "123"),
        ])
        params_string = urlencode(signable_pairs)
        sign = _make_sign(params_string)
        # Replace vk_ts with non-numeric value
        broken = params_string.replace(f"vk_ts={vk_ts}", "vk_ts=notanumber")
        broken += "&sign=" + sign
        self.assertIsNone(self.validator.validate(broken))


if __name__ == "__main__":
    unittest.main()
