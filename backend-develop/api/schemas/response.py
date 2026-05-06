from ninja import Schema


class MessageResponse(Schema):
	message: str

class TokenResponse(Schema):
	token: str
