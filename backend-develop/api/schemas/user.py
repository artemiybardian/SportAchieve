from ninja import Schema


class UserSchema(Schema):
	id: int
	username: str
	email: str
	photo: str
	last_name: str
	first_name: str
	is_onboarding_complete: bool
