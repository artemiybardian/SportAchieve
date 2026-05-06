from ninja import Schema
from datetime import datetime

class EventLogCreateSchema(Schema):
	event_type_id: int

class EventLogSchema(Schema):
	id: int
	event_type_id: int
	user_id: int
