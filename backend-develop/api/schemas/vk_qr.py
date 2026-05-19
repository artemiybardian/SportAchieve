from ninja import Schema


class VkQrResolveSchema(Schema):
	trainer_uuid: str
	gym_id: int
