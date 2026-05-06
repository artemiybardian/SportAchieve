from ninja import Schema
from typing import Optional


class RegisterSchema(Schema):
	email: str
	password: str
	first_name: Optional[str] = ""
	last_name: Optional[str] = ""


class LoginSchema(Schema):
	email: str
	password: str


class MeSchema(Schema):
	id: int
	username: str
	email: str
	first_name: str
	last_name: str
	profile_photo: Optional[str] = None
	is_onboarding_complete: bool
