from typing import TypedDict


class TelegramUser(TypedDict):
	id: int
	first_name: str
	last_name: str
	username: str
	language_code: str
	is_premium: bool
	photo_url: str


class InitData(TypedDict):
	user: TelegramUser
	chat_instance: int
	chat_type: str
	auth_date: int
	signature: str
	
	