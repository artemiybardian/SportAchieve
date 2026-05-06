import traceback
from typing import Optional, Literal

import requests
from requests import HTTPError

from yookasa import build_basic_auth_header
from yookasa.types import PaymentResponseDict


class YookasaClient:
	BASE_URL = "https://api.yookassa.ru/v3"
	
	def __init__(self, shop_id: int, secret_key: str):
		self._auth_header = build_basic_auth_header(
			username=str(shop_id),
			password=secret_key
		)
		self._auth = (shop_id, secret_key)
	
	def make_invoice(
			self,
			amount: float,
			invoice_id: int,
			description: str,
			return_url: str,
			save_payment_method: bool = True,
			idempotence_key: Optional[str] = None,
			payment_method_id: Optional[str] = None,
			payment_method: Literal["bank_card", "sbp"] = "bank_card"
	) -> Optional[PaymentResponseDict]:
		data = {
		    "amount": {
		        "value": str(amount) + "0",
		        "currency": "RUB"
		    },
		    "capture": True,
		    "confirmation": {
		        "type": "redirect",
		        "return_url": return_url
		    },
			"payment_method_data": {
				"type": payment_method
			},
		    "description": description,
			"metadata": {
				"invoice_id": invoice_id
			},
			"save_payment_method": save_payment_method
		}
		
		headers = {}
		if idempotence_key:
			headers["Idempotence-Key"] = idempotence_key
		
		if payment_method_id:
			data.update({"payment_method_id": payment_method_id})

		response = requests.post(f"{self.BASE_URL}/payments/", json=data, headers=headers, auth=self._auth)
		if response.status_code == 200:
			return response.json()
		else:
			e = HTTPError(response.json()["description"])
			traceback.print_exception(e)
			return None
