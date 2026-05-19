from typing import Optional

from ninja import Schema


class MaxProfileSyncSchema(Schema):
	first_name: str = ""
	last_name: str = ""
	profile_photo: Optional[str] = None
