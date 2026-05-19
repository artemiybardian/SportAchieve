from ninja import Schema


class MaxQrResolveSchema(Schema):
	trainer_uuid: str
	gym_id: int
