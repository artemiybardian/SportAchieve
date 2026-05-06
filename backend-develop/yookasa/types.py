from typing import TypedDict, Optional, Dict, Any


class AmountDict(TypedDict):
    value: str
    currency: str


class RecipientDict(TypedDict):
    account_id: str
    gateway_id: str


class ConfirmationDict(TypedDict):
    type: str
    confirmation_url: Optional[str]
    return_url: Optional[str]

class CardDict(TypedDict):
    first6: str
    last4: str
    expiry_month: str
    expiry_year: str
    card_type: str
    card_product: dict
    issuer_country: str
    issuer_name: str

class PaymentMethodDict(TypedDict):
    id: str
    title: str
    type: str
    saved: bool
    card: CardDict

class PaymentResponseDict(TypedDict):
    id: str
    status: str
    amount: AmountDict
    description: Optional[str]
    recipient: Optional[RecipientDict]
    created_at: str
    confirmation: Optional[ConfirmationDict]
    payment_method: Optional[PaymentMethodDict]
    test: bool
    paid: bool
    refundable: bool
    metadata: Dict[str, Any]
