from ninja import Schema
from datetime import datetime

class EventTypeSchema(Schema):
	id: int
	name: str
