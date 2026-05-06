from typing import List, Optional
from ninja import Schema, ModelSchema
from api.models.SubscriptionModel import SubscriptionModel
from api.models.SubscriptionTypeModel import SubscriptionTypeModel
from api.models.SubscriptionTypeScopeModel import SubscriptionTypeScopeModel
from .exercise import ExerciseSchema

class SubscriptionTypeScopeSchema(Schema):
    id: int
    exercise: Optional[ExerciseSchema] = None

class SubscriptionTypeSchema(Schema):
    id: int
    name: str
    price: float
    access_duration_in_days: int
    scope_type: str
    exercises: List[SubscriptionTypeScopeSchema] = []

    @staticmethod
    def resolve_exercises(obj):
        scopes = SubscriptionTypeScopeModel.objects.filter(type=obj)
        return list(scopes)

class SubscriptionSchema(Schema):
    id: int
    type: SubscriptionTypeSchema
    is_enabled: bool
    is_valid: bool
    canceled_at: Optional[str]
    updated_at: str
    created_at: str

    @staticmethod
    def resolve_canceled_at(obj):
        if obj.canceled_at is None:
            return None
        return obj.canceled_at.isoformat()

    @staticmethod
    def resolve_updated_at(obj):
        return obj.updated_at.isoformat()

    @staticmethod
    def resolve_created_at(obj):
        return obj.created_at.isoformat()
