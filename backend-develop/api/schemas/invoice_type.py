from typing import List, Optional
from ninja import Schema


class InvoiceTypeScopeSchema(Schema):
    id: int
    name: str


class InvoiceTypeSchema(Schema):
    id: int
    name: str
    description: str
    price: float
    scop_type: str
    exercises: List[InvoiceTypeScopeSchema]
