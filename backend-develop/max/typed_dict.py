from typing import TypedDict


class MAXUser(TypedDict):
    max_user_id: int
    first_name: str
    last_name: str
    username: str | None
    photo_url: str | None
