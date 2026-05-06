from datetime import datetime
from typing import Literal

from ninja import Schema

from api.schemas.invoice_type import InvoiceTypeScopeSchema


class InvoiceCreateSchema(Schema):
    subscription_type_id: int
    return_url: str
    payment_method: Literal["bank_card", "sbp"]

class InvoiceSchema(Schema):
    id: int
    user_id: int
    type_id: int
    status: str
    description: str
    confirmation_url: str
    created_at: datetime

class UserInvoice(Schema):
    id: int
    user_id: int
    type: InvoiceTypeScopeSchema
    status: str
    description: str
    confirmation_url: str
    created_at: datetime
